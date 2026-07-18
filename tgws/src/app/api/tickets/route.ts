import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTicketCreatedEmail } from '@/lib/resend';
import { randomBytes } from 'crypto';

// --- Constants ---------------------------------------------------------------

const VALID_CATEGORIES = ['build', 'run', 'protect'] as const;
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

const LIMITS = {
  subject: 200,
  description: 800,
  productService: 100,
  idempotencyKey: 128,
} as const;

const TICKET_NUMBER_MAX_RETRIES = 3;

// --- Helpers -----------------------------------------------------------------

type ErrorCode =
  | 'unauthorized'
  | 'validation_failed'
  | 'idempotency_conflict'
  | 'not_found'
  | 'forbidden'
  | 'ticket_number_collision'
  | 'internal_error';

function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } },
    { status }
  );
}

/**
 * Generate a 6-char base36 ticket number with a "TG-" prefix.
 * Example: "TG-A3F9K2". Collisions are handled by the caller via retry.
 */
function generateTicketNumber(): string {
  // 36^6 ≈ 2.17B; randomBytes(4) gives ~4.29B range, modulo is fine.
  const num = randomBytes(4).readUInt32BE() % 36 ** 6;
  return 'TG-' + num.toString(36).toUpperCase().padStart(6, '0');
}

interface ValidationResult {
  ok: boolean;
  code?: ErrorCode;
  message?: string;
}

function validateCreatePayload(input: {
  category?: unknown;
  productService?: unknown;
  subject?: unknown;
  description?: unknown;
  priority?: unknown;
  idempotencyKey?: unknown;
}): ValidationResult {
  const { category, productService, subject, description, priority, idempotencyKey } = input;

  if (typeof category !== 'string' || !VALID_CATEGORIES.includes(category as never)) {
    return {
      ok: false,
      code: 'validation_failed',
      message: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
    };
  }
  if (typeof subject !== 'string' || subject.trim().length === 0 || subject.length > LIMITS.subject) {
    return {
      ok: false,
      code: 'validation_failed',
      message: `subject is required and must be ≤ ${LIMITS.subject} chars`,
    };
  }
  if (typeof description !== 'string' || description.trim().length === 0 || description.length > LIMITS.description) {
    return {
      ok: false,
      code: 'validation_failed',
      message: `description is required and must be ≤ ${LIMITS.description} chars`,
    };
  }
  if (typeof productService !== 'string' || productService.trim().length === 0 || productService.length > LIMITS.productService) {
    return {
      ok: false,
      code: 'validation_failed',
      message: `productService is required and must be ≤ ${LIMITS.productService} chars`,
    };
  }
  if (priority !== undefined && (typeof priority !== 'string' || !VALID_PRIORITIES.includes(priority as never))) {
    return {
      ok: false,
      code: 'validation_failed',
      message: `priority must be one of: ${VALID_PRIORITIES.join(', ')}`,
    };
  }
  if (idempotencyKey !== undefined && idempotencyKey !== null) {
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length === 0 || idempotencyKey.length > LIMITS.idempotencyKey) {
      return {
        ok: false,
        code: 'validation_failed',
        message: `idempotency_key must be a non-empty string ≤ ${LIMITS.idempotencyKey} chars`,
      };
    }
  }
  return { ok: true };
}

// --- POST: create ticket -----------------------------------------------------

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse('unauthorized', 'Unauthorized', 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('validation_failed', 'Invalid JSON body', 400);
  }

  const {
    category,
    productService,
    subject,
    description,
    occurredAt,
    priority,
    idempotencyKey,
  } = body as {
    category?: string;
    productService?: string;
    subject?: string;
    description?: string;
    occurredAt?: string;
    priority?: string;
    idempotencyKey?: string;
  };

  // 1. Validate fields
  const validation = validateCreatePayload({
    category,
    productService,
    subject,
    description,
    priority,
    idempotencyKey,
  });
  if (!validation.ok) {
    return errorResponse(validation.code!, validation.message!, 400);
  }

  // 2. Idempotency: if idempotency_key provided, check for existing ticket
  if (idempotencyKey) {
    const { data: existing, error: idemErr } = await supabase
      .from('tickets')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (idemErr) {
      // 42703 = undefined_column: migration 003 not applied yet. Log and skip
      // the idempotency check rather than failing — preserves backward compat.
      if (idemErr.code === '42703' && idemErr.message?.includes('idempotency_key')) {
        console.warn(
          '[tickets/POST] idempotency_key column missing — skipping idempotency lookup. Apply migration 003 to enable.'
        );
      } else {
        console.error('[tickets/POST] idempotency lookup failed:', idemErr.message);
        return errorResponse('internal_error', 'Idempotency check failed', 500);
      }
    } else if (existing) {
      // Return the original ticket (idempotent replay)
      return NextResponse.json({ success: true, data: existing, idempotent_replay: true });
    }
  }

  // 3. Generate ticket_number with collision retry (6-char base36)
  let ticketNumber = '';
  let inserted: Record<string, unknown> | null = null;
  let lastInsertError: unknown = null;
  // Fallback flag: if migration 003 has not been applied yet (column missing),
  // we drop idempotency_key from the payload and proceed without idempotency
  // rather than failing the request. This lets the code ship before the DB
  // migration is applied.
  let dropIdempotencyKey = false;

  for (let attempt = 0; attempt < TICKET_NUMBER_MAX_RETRIES; attempt++) {
    ticketNumber = generateTicketNumber();

    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      ticket_number: ticketNumber,
      category,
      product_service: productService,
      subject,
      description,
      priority: priority || 'medium',
      occurred_at: occurredAt || null,
      ...(idempotencyKey && !dropIdempotencyKey ? { idempotency_key: idempotencyKey } : {}),
    };

    const { data, error } = await supabase
      .from('tickets')
      .insert(insertPayload)
      .select()
      .single();

    if (!error) {
      inserted = data;
      break;
    }

    lastInsertError = error;

    // If it's a unique violation on ticket_number, retry with a new number.
    // If it's a unique violation on idempotency_key, a concurrent request won — fetch it.
    if (error.code === '23505') {
      // PostgreSQL unique_violation
      if (idempotencyKey && !dropIdempotencyKey && error.message?.includes('idempotency_key')) {
        const { data: concurrent, error: fetchErr } = await supabase
          .from('tickets')
          .select('*')
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle();
        if (!fetchErr && concurrent) {
          return NextResponse.json({ success: true, data: concurrent, idempotent_replay: true });
        }
        // fallthrough to retry if fetch failed
      }
      // Otherwise: ticket_number collision, retry
      continue;
    }

    // PostgreSQL undefined_column (42703): migration 003 not applied yet.
    // Strip idempotency_key and retry — preserves backward compatibility.
    if (
      error.code === '42703' &&
      !dropIdempotencyKey &&
      error.message?.includes('idempotency_key')
    ) {
      console.warn(
        '[tickets/POST] idempotency_key column missing — falling back to non-idempotent insert. Apply migration 003 to enable idempotency.'
      );
      dropIdempotencyKey = true;
      // Don't consume an attempt for this fallback; restart loop with same attempt index.
      attempt -= 1;
      continue;
    }

    // Any other error: return immediately
    console.error('[tickets/POST] insert failed:', error.message);
    return errorResponse('internal_error', error.message, 500);
  }

  if (!inserted) {
    console.error('[tickets/POST] ticket_number collision exhausted:', String(lastInsertError));
    return errorResponse(
      'ticket_number_collision',
      'Failed to generate a unique ticket number after retries',
      500
    );
  }

  const ticketRow = inserted as { id: string; ticket_number: string; subject: string; category: string };

  // 4. Insert audit_log entry (best-effort within the "transaction").
  //    If audit_log insertion fails (e.g. RLS policy), we do NOT rollback the ticket
  //    creation — audit_log is best-effort. Email failure also does not rollback.
  const { error: auditErr } = await supabase.from('ticket_audit_log').insert({
    ticket_id: ticketRow.id,
    action: 'created',
    new_value: JSON.stringify({ status: 'open', priority: priority || 'medium' }),
    performed_by: user.id,
  });

  if (auditErr) {
    // Log but do not fail the request — ticket creation is the primary effect.
    console.warn('[tickets/POST] audit_log insert failed:', auditErr.message);
  }

  // 5. Send confirmation email (non-blocking, compensation: failure does not rollback ticket)
  if (user.email) {
    sendTicketCreatedEmail(
      user.email,
      ticketRow.ticket_number,
      ticketRow.subject,
      ticketRow.category
    ).catch((err) => {
      console.warn('[tickets/POST] sendTicketCreatedEmail failed:', String(err));
    });
  }

  return NextResponse.json({ success: true, data: inserted });
}

// --- GET: list user's tickets ------------------------------------------------

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse('unauthorized', 'Unauthorized', 401);
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[tickets/GET] list failed:', error.message);
    return errorResponse('internal_error', error.message, 500);
  }

  return NextResponse.json({ success: true, data });
}
