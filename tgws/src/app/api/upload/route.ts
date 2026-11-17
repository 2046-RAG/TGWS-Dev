import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';
import { rateLimit, requireSameOrigin } from '@/lib/api-guard';
import { ATTACHMENT_BUCKET, signedAttachmentUrl } from '@/lib/tickets/attachments';

const MAX_SIZE = 50 * 1024 * 1024;

// The UI promises "any file" (documents, images, audio, video, archives, etc.),
// so use a DENY-list instead of an ever-growing allow-list. Only formats that
// can execute script or code when opened inline are blocked; everything else
// is accepted. (A whitelist kept rejecting legitimate files such as .md.)
const BLOCKED_EXT = /\.(svg|html?|xhtml|xml|js|mjs|cjs|jsx|ts|tsx|php|phtml|asp|aspx|jsp|jspx|exe|bat|cmd|sh|bash|zsh|ps1|vbs|vbscript|scr|com|dll|msi|msp|jar|war|app|apk|hta|reg)$/i;
const BLOCKED_MIME = /^(image\/svg\+xml|text\/html|application\/xhtml\+xml|application\/(javascript|x-javascript|ecmascript)|text\/javascript|text\/ecmascript|application\/x-shockwave-flash)$/i;

function isBlockedFile(name: string, mime: string): boolean {
  // Check both signals: a harmless extension with a script MIME (or vice
  // versa) must still be rejected. Empty MIME is fine — the extension decides.
  if (BLOCKED_EXT.test(name)) return true;
  if (mime && BLOCKED_MIME.test(mime)) return true;
  return false;
}

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

    // Deny only script/executable formats (XSS + code execution). A missing
    // MIME type is fine: the extension is checked too, so it cannot bypass
    // the block (AUDIT-012).
    if (isBlockedFile(file.name, file.type)) {
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
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 });
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
      return NextResponse.json({ error: 'Metadata insert failed' }, { status: 500 });
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
