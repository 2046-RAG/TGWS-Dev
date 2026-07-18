import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 5 req/min/IP — protects against password-reset endpoint abuse (used to
// enumerate accounts or flood inboxes).
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

interface ApiErrorBody {
  success: false;
  error: { code: string; message: string };
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
  // Rate limit BEFORE any Supabase work.
  const ip = getClientIp(request);
  const rl = rateLimit(
    `reset-password:${ip}`,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rl.success) {
    return rateLimitedResponse(rl.resetAt);
  }

  const logCtx: Record<string, unknown> = { ip };

  try {
    let body: { email?: string };
    try {
      body = (await request.json()) as { email?: string };
    } catch {
      return errorResponse('INVALID_JSON', 'Invalid JSON body', 400);
    }

    const { email } = body || {};

    if (!email) {
      return errorResponse('EMAIL_REQUIRED', 'Email is required', 400);
    }

    if (!emailRegex.test(email)) {
      return errorResponse('INVALID_EMAIL', 'Invalid email format', 400);
    }

    logCtx.email = email;

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase(),
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/support/login`,
      }
    );

    if (error) {
      // Don't reveal whether the email exists — log server-side only.
      logError('/api/auth/reset-password', error, logCtx);
      return errorResponse(
        'RESET_FAILED',
        'Unable to send reset email',
        500
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logError('/api/auth/reset-password', err, logCtx);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
