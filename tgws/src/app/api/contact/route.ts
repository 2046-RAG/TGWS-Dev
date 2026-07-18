import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOdooLead } from '@/lib/odoo';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 5 req/min/IP — protects against contact-form spam / lead flooding.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

interface ApiErrorBody {
  success: false;
  error: { code: string; message: string };
}

interface ContactBody {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  message?: string;
}

function errorResponse(
  code: string,
  message: string,
  status: number
): NextResponse<ApiErrorBody> {
  return NextResponse.json<ApiErrorBody>(
    { success: false, error: { code, message } },
    { status }
  );
}

function logError(
  path: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      path,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : String(error),
      ...context,
    })
  );
}

function rateLimitedResponse(resetAt: number) {
  const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json<ApiErrorBody>(
    {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later',
      },
    },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSec) },
    }
  );
}

export async function POST(request: Request) {
  // Rate limit BEFORE any DB / Odoo work — fails fast for spammers.
  const ip = getClientIp(request);
  const rl = rateLimit(`contact:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!rl.success) {
    return rateLimitedResponse(rl.resetAt);
  }

  const logCtx: Record<string, unknown> = { ip };

  try {
    let body: ContactBody;
    try {
      body = (await request.json()) as ContactBody;
    } catch {
      return errorResponse('INVALID_JSON', 'Invalid JSON body', 400);
    }

    const { name, email, company, phone, message } = body || {};

    if (!name || !email || !message) {
      return errorResponse(
        'MISSING_FIELDS',
        'Name, email, and message are required',
        400
      );
    }

    if (!emailRegex.test(email)) {
      return errorResponse('INVALID_EMAIL', 'Invalid email format', 400);
    }

    logCtx.email = email;

    const supabase = await createClient();
    // Insert + return the row id so the fire-and-forget Odoo sync can write
    // back `odoo_synced = true` once it succeeds. select('id').single() gives
    // us the id without extra round-trips.
    const { data: insertedRow, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({ name, email, company, phone, message })
      .select('id')
      .single();

    if (dbError) {
      // Don't leak Supabase error.message to the client.
      logError('/api/contact', dbError, logCtx);
      return errorResponse('DB_ERROR', 'Failed to submit form', 500);
    }

    // Non-blocking Odoo sync: the user's submission is already persisted, so
    // we return 200 immediately and let CRM sync happen in the background.
    // On success we flip `odoo_synced` to true; on failure it stays false
    // and a backend job can pick it up for retry.
    //
    // NOTE: in a serverless runtime (Vercel functions) the platform may
    // terminate the invocation shortly after the response is sent, which
    // could interrupt the deferred work. For now we accept that trade-off
    // (matches the task spec) rather than pulling in `after()` / waitUntil.
    const submissionId = insertedRow?.id;
    if (submissionId) {
      Promise.resolve()
        .then(async () => {
          try {
            await createOdooLead({
              name,
              email,
              company,
              phone,
              description: message,
            });
            const { error: updateErr } = await supabase
              .from('contact_submissions')
              .update({ odoo_synced: true })
              .eq('id', submissionId);
            if (updateErr) {
              logError('/api/contact', updateErr, {
                ...logCtx,
                stage: 'odoo_synced_writeback',
                submissionId,
              });
            }
          } catch (odooErr) {
            // odoo_synced stays false; a backend job can retry later.
            logError('/api/contact', odooErr, {
              ...logCtx,
              stage: 'odoo_sync',
              submissionId,
            });
          }
        })
        .catch((unexpectedErr) => {
          logError('/api/contact', unexpectedErr, {
            ...logCtx,
            stage: 'odoo_sync_unexpected',
            submissionId,
          });
        });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logError('/api/contact', err, logCtx);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
