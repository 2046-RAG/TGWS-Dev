import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';

const MAX_SIZE = 50 * 1024 * 1024;
// SVG removed: it can carry <script>/onload= XSS if served inline (AUDIT-016).
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain', 'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Strip path separators and cap length so file.name can't traverse the
// bucket or exceed object-key limits (AUDIT-013).
function sanitizeFileName(name: string): string {
  const base = name.replace(/[\\/]/g, '_').replace(/^\.+/, '');
  return base.slice(0, 120) || 'attachment';
}

export async function POST(request: Request) {
  try {
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
    if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
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
      .from('ticket-attachments')
      .upload(filePath, file);

    if (uploadError) {
      logServiceError({ service: 'Upload', operation: 'storageUpload', error: uploadError });
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('ticket-attachments').getPublicUrl(filePath);

    const { error: insertError } = await supabase.from('ticket_attachments').insert({
      ticket_id: ticketId,
      file_name: safeName,
      file_url: publicUrl,
      file_size: file.size,
      file_type: file.type,
    });

    if (insertError) {
      // Roll back the orphaned storage object so the DB and bucket stay in sync.
      await supabase.storage.from('ticket-attachments').remove([filePath]);
      logServiceError({ service: 'Upload', operation: 'metadataInsert', error: insertError });
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { url: publicUrl, name: safeName, size: file.size, type: file.type },
    });
  } catch (error) {
    logServiceError({ service: 'Upload', operation: 'upload', error });
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
