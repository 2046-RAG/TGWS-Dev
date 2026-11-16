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
      .select('id, user_id, ticket_number, subject, status')
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

    // G7: a customer reply must put the ticket back in the queue. Customers
    // have no UPDATE policy on `tickets` (001 only grants admins), so this is
    // a SECURITY DEFINER helper that can only touch the caller's own ticket.
    // A failure here must not lose the reply that was just stored.
    if (!isAdmin) {
      const { error: reopenError } = await supabase.rpc('reopen_ticket_on_customer_reply', {
        p_ticket_id: id,
      });
      if (reopenError) {
        logServiceError({ service: 'Tickets', operation: 'reopenOnReply', error: reopenError });
      }
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
        // Reading the owner row directly is blocked by the "view own profile"
        // policy; the helper returns it only for tickets the caller can see.
        const { data: ownerEmail, error: ownerError } = await supabase.rpc(
          'get_ticket_owner_email',
          { p_ticket_id: id },
        );
        if (ownerError) {
          logServiceError({ service: 'Tickets', operation: 'ownerEmailLookup', error: ownerError });
        } else if (ownerEmail) {
          void notify(String(ownerEmail), 'Support Team');
        }
      } else {
        // G8: querying `users` as a customer returned an empty array under RLS,
        // so admins were never notified. The helper exposes staff emails only.
        const { data: staff, error: staffError } = await supabase.rpc('get_staff_emails');
        if (staffError) {
          logServiceError({ service: 'Tickets', operation: 'staffEmails', error: staffError });
        } else {
          const emails = (Array.isArray(staff) ? staff : [])
            .map((row) =>
              typeof row === 'string' ? row : (row as { email?: string })?.email,
            )
            .filter((email): email is string => Boolean(email));
          for (const email of emails) {
            void notify(email, user.email || 'Customer');
          }
        }
      }
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logServiceError({ service: 'Tickets', operation: 'createComment', error });
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 });
  }
}
