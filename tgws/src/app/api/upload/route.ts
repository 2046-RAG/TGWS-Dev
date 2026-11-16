import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';
import { rateLimit, requireSameOrigin } from '@/lib/api-guard';
import { ATTACHMENT_BUCKET, signedAttachmentUrl } from '@/lib/tickets/attachments';

const MAX_SIZE = 50 * 1024 * 1024;
// SVG removed: it can carry <script>/onload= XSS if served inline (AUDIT-016).
const ALLOWED_TYPES = [
  // images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  // documents
  'application/pdf', 'text/plain', 'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // audio
  'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/webm',
  'audio/ogg', 'audio/aac', 'audio/flac', 'audio/x-m4a',
  // video
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
  'video/x-matroska',
  // archives
  'application/zip', 'application/x-7z-compressed',
  'application/x-rar-compressed', 'application/gzip', 'application/x-tar',
];

// Browsers sometimes send an empty or generic MIME type (e.g. .7z, .rar).
// Fall back to the extension so "any format" in the UI is truthful.
const ALLOWED_EXT = /\.(pdf|png|jpe?g|gif|webp|txt|csv|docx?|xlsx?|pptx?|mp3|wav|ogg|m4a|aac|flac|mp4|mov|webm|avi|mkv|zip|7z|rar|gz|tar)$/i;

// Strip path separators and cap length so file.name can't traverse the
// bucket or exceed object-key limits (AUDIT-013).
function sanitizeFileName(name: string): string {
  const base = name.replace(/[\\/]/g, '_').replace(/^\.+/, '');
  return base.slice(0, 120) || 'attachment';
}

export async function POST(request: Request) {
  try {
    const blocked = requireSameOrigin(request) ?? rateLimit(request, { name: 'upload', limit: 10, windowMs: 60_000 });
    if (blocked) return blocked;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const ticketId = formData.get('ticketId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });
    }

    // Reject empty MIME types — the whitelist must not be bypassable by
    // omitting Content-Type (AUDIT-012).
    if ((!file.type || !ALLOWED_TYPES.includes(file.type)) && !ALLOWED_EXT.test(file.name)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Uploads must be tied to a ticket the user owns. Check ownership BEFORE
    // writing to storage so no orphan files are left on the 403 path
    // (AUDIT-015).
    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('user_id')
      .eq('id', ticketId)
      .is('deleted_at', null)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const safeName = sanitizeFileName(file.name);
    const filePath = `${user.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      logServiceError({ service: 'Upload', operation: 'storageUpload', error: uploadError });
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // P0-3 (G3): the bucket is private, so we store the object path instead of
    // a permanent public URL. Readers get a short-lived signed URL generated
    // on demand (see lib/tickets/attachments.ts).
    const { error: insertError } = await supabase.from('ticket_attachments').insert({
      ticket_id: ticketId,
      file_name: safeName,
      file_url: filePath,
      file_size: file.size,
      file_type: file.type,
    });

    if (insertError) {
      // Roll back the orphaned storage object so the DB and bucket stay in sync.
      await supabase.storage.from(ATTACHMENT_BUCKET).remove([filePath]);
      logServiceError({ service: 'Upload', operation: 'metadataInsert', error: insertError });
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Hand back a signed URL for the success-state thumbnail only.
    const signedUrl = await signedAttachmentUrl(supabase, filePath);

    return NextResponse.json({
      success: true,
      data: { url: signedUrl, path: filePath, name: safeName, size: file.size, type: file.type },
    });
  } catch (error) {
    logServiceError({ service: 'Upload', operation: 'upload', error });
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
