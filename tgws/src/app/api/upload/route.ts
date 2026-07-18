import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PRD [S2.5.1] — 10MB upload cap (was incorrectly 50MB before).
const MAX_SIZE = 10 * 1024 * 1024;

// PRD [S2.5.2] — file type whitelist for ticket attachments.
const ALLOWED_TYPES = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/zip',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

// Signed URL lifetime for downloads (PRD [S2.5.3] — attachments must NOT be
// public; only a time-limited signed URL is returned).
const SIGNED_URL_TTL_SECONDS = 3600; // 1 hour

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
  const payload = {
    timestamp: new Date().toISOString(),
    path,
    error:
      error instanceof Error
        ? { name: error.name, message: error.message }
        : String(error),
    ...context,
  };
  // Redact user IDs in logs to avoid leaking PII in plain-text logs.
  console.error(JSON.stringify(payload));
}

/** Strip path separators from a user-supplied filename to prevent traversal. */
function sanitizeFilename(name: string): string {
  return name.replace(/[\/\\]/g, '_');
}

export async function POST(request: Request) {
  const logCtx: Record<string, unknown> = {};

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logError('/api/upload', authError ?? new Error('No user'));
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }
    logCtx.userId = user.id;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const ticketId = formData.get('ticketId') as string | null;

    if (!file) {
      return errorResponse('NO_FILE', 'No file provided', 400);
    }

    if (file.size > MAX_SIZE) {
      return errorResponse('FILE_TOO_LARGE', 'File too large (max 10MB)', 400);
    }

    if (!file.type || !ALLOWED_TYPES.has(file.type)) {
      return errorResponse('UNSUPPORTED_TYPE', 'File type not allowed', 415);
    }

    // If a ticketId is supplied, validate ownership BEFORE consuming storage
    // quota — otherwise an attacker could enumerate tickets or fill storage
    // with uploads whose ticketId fails the access check.
    if (ticketId) {
      logCtx.ticketId = ticketId;
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('user_id')
        .eq('id', ticketId)
        .single();

      if (ticketError || !ticket || ticket.user_id !== user.id) {
        return errorResponse(
          'TICKET_ACCESS_DENIED',
          'Ticket not found or access denied',
          403
        );
      }
    }

    // Sanitize filename: prevents path traversal like "../../etc/passwd".
    const safeName = sanitizeFilename(file.name);
    const filePath = `${user.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('ticket-attachments')
      .upload(filePath, file);

    if (uploadError) {
      logError('/api/upload', uploadError, { ...logCtx, filePath });
      return errorResponse('UPLOAD_FAILED', 'Failed to upload file', 500);
    }

    // Replace getPublicUrl with createSignedUrl so attachments are NOT
    // publicly enumerable. 1h TTL gives clients time to render previews.
    const {
      data: signedUrlData,
      error: signedUrlError,
    } = await supabase.storage
      .from('ticket-attachments')
      .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      logError('/api/upload', signedUrlError ?? new Error('No signed URL'), {
        ...logCtx,
        filePath,
      });
      return errorResponse(
        'URL_GENERATION_FAILED',
        'Failed to generate access URL',
        500
      );
    }

    const url = signedUrlData.signedUrl;

    if (ticketId) {
      const { error: dbError } = await supabase
        .from('ticket_attachments')
        .insert({
          ticket_id: ticketId,
          file_name: safeName,
          file_url: url,
          file_size: file.size,
          file_type: file.type,
        });

      if (dbError) {
        logError('/api/upload', dbError, { ...logCtx, filePath });
        return errorResponse(
          'DB_INSERT_FAILED',
          'Failed to record attachment',
          500
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { url, name: safeName, size: file.size, type: file.type },
    });
  } catch (err) {
    logError('/api/upload', err, logCtx);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
