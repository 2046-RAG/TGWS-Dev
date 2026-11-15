import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTicketReplyEmail } from '@/lib/resend';
import { logServiceError } from '@/lib/errors';
import { rateLimit, requireSameOrigin, validateFields } from '@/lib/api-guard';

/**
 * T-060: add a reply to a ticket conversation.
 * - Customers can only reply to their own tickets, and only public replies.
 * - Admins can reply to any ticket and may mark a note as internal.
 * - Public replies notify the other side by email (never blocks the response).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const blocked =
      requireSameOrigin(request) ??
      rateLimit(request, { name: 'ticket-comment', limit: 10, windowMs: 60_000 });
    if (blocked) return blocked;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const fieldError = validateFields(body, { content: { required: true, max: 2000 } });
    if (fieldError) {
      return NextResponse.json({ error: fieldError }, { status: 400 });
    }
    const content = String(body.content).trim();
    const wantsInternal = body.isInternal === true;

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, user_id, ticket_number, subject')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const { data: roleRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    const isAdmin = roleRow?.role === 'admin' || roleRow?.role === 'super_admin';

    if (!isAdmin && ticket.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (wantsInternal && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: id,
        user_id: user.id,
        content,
        is_internal: wantsInternal,
      })
      .select()
      .single();
    if (error || !data) {
      logServiceError({ service: 'Tickets', operation: 'createComment', error });
      return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 });
    }

    // Best-effort audit entry; a failure here must not lose the reply.
    const { error: auditError } = await supabase.from('ticket_audit_log').insert({
      ticket_id: id,
      action: 'comment_added',
      new_value: JSON.stringify({ is_internal: wantsInternal }),
      performed_by: user.id,
    });
    if (auditError) {
      logServiceError({ service: 'Tickets', operation: 'auditComment', error: auditError });
    }

    // Internal notes are never emailed. Public replies notify the other side.
    if (!wantsInternal) {
      const notify = (to: string, author: string) =>
        sendTicketReplyEmail(to, ticket.ticket_number, ticket.subject, author, content).catch(
          (err) => logServiceError({ service: 'Resend', operation: 'ticketReplyEmail', error: err })
        );

      if (isAdmin) {
        const { data: owner } = await supabase
          .from('users')
          .select('email')
          .eq('id', ticket.user_id)
          .single();
        if (owner?.email) void notify(owner.email, 'Support Team');
      } else {
        const { data: admins } = await supabase
          .from('users')
          .select('email')
          .in('role', ['admin', 'super_admin']);
        for (const admin of admins || []) {
          if (admin.email) void notify(admin.email, user.email || 'Customer');
        }
      }
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logServiceError({ service: 'Tickets', operation: 'createComment', error });
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 });
  }
}
