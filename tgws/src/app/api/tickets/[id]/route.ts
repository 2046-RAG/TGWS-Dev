import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';
import { parseJsonBody, rateLimit, requireSameOrigin } from '@/lib/api-guard';
import {
  applyStatusChange,
  isTicketPriority,
  isTicketStatus,
} from '@/lib/tickets/status-change';
import { withSignedAttachments } from '@/lib/tickets/attachments';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Db = Awaited<ReturnType<typeof createClient>>;

async function isAdminUser(db: Db, userId: string): Promise<boolean> {
  const { data } = await db.from('users').select('role').eq('id', userId).single();
  const role = (data as { role?: string } | null)?.role;
  return role === 'admin' || role === 'super_admin';
}

/**
 * Validate an assignee id. `is_staff_user` is a SECURITY DEFINER helper (008)
 * because an admin cannot read other rows of `users` under the
 * "view own profile" policy. If the migration is not applied yet we fall back
 * to a syntactic UUID check so the feature keeps working.
 */
async function resolveAssignee(
  db: Db,
  raw: unknown,
): Promise<{ ok: true; value: string | null } | { ok: false; message: string }> {
  if (raw === null || raw === undefined || raw === '') return { ok: true, value: null };
  if (typeof raw !== 'string' || !UUID_RE.test(raw)) {
    return { ok: false, message: 'Invalid assignedTo' };
  }

  const { data, error } = await db.rpc('is_staff_user', { p_id: raw });
  if (error) {
    logServiceError({ service: 'Tickets', operation: 'isStaffUser', error });
    return { ok: true, value: raw };
  }
  if (data !== true) return { ok: false, message: 'assignedTo must be a staff user' };
  return { ok: true, value: raw };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const admin = await isAdminUser(supabase, user.id);
    const record = ticket as { user_id?: string };
    if (!admin && record.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: attachments } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', id);

    // P0-3: the bucket is private; swap stored paths for short-lived signed
    // URLs so the browser never receives a permanent link.
    const signedAttachments = await withSignedAttachments(
      supabase,
      (attachments || []) as { file_url: string | null }[],
    );

    const { data: comments } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    // T-058: admins also get the audit trail for the detail timeline.
    // Customers never receive it (and the query is skipped entirely).
    let audit: unknown[] = [];
    if (admin) {
      const { data: logs, error: auditError } = await supabase
        .from('ticket_audit_log')
        .select('*')
        .eq('ticket_id', id)
        .order('performed_at', { ascending: false });
      if (auditError) {
        logServiceError({ service: 'Tickets', operation: 'auditList', error: auditError });
      }
      audit = logs || [];
    }

    // T-060: internal notes must never reach a customer, even if RLS is
    // misconfigured. RLS (007) filters them too — this is the second layer.
    const visibleComments = admin
      ? (comments || [])
      : (comments || []).filter(
          (c) => !(c as { is_internal?: boolean }).is_internal
        );

    return NextResponse.json({
      success: true,
      data: {
        ...ticket,
        attachments: signedAttachments,
        comments: visibleComments,
        audit,
      },
    });
  } catch (error) {
    logServiceError({ service: 'Tickets', operation: 'get', error });
    return NextResponse.json({ error: 'Failed to load ticket' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // G14: this route mutates a ticket, so it gets the same origin + rate
    // limiting as ticket creation and replies.
    const blocked =
      requireSameOrigin(request) ??
      rateLimit(request, { name: 'ticket-update', limit: 30, windowMs: 60_000 });
    if (blocked) return blocked;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const parsed = await parseJsonBody(request);
    if ('response' in parsed) return parsed.response;
    const body = parsed.body;

    // G6: status / priority / assignment are staff-only fields. Previously a
    // customer passed the ownership check and then hit an RLS rejection,
    // which surfaced as a confusing 500 instead of a 403.
    if (!(await isAdminUser(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (body.status !== undefined && !isTicketStatus(body.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    if (body.priority !== undefined && !isTicketPriority(body.priority)) {
      return NextResponse.json({ error: 'Invalid priority value' }, { status: 400 });
    }

    const extraPatch: Record<string, unknown> = {};
    if (body.priority !== undefined) extraPatch.priority = body.priority;

    if ('assignedTo' in body) {
      const assignee = await resolveAssignee(supabase, body.assignedTo);
      if (!assignee.ok) {
        return NextResponse.json({ error: assignee.message }, { status: 400 });
      }
      extraPatch.assigned_to = assignee.value;
    }

    const outcome = await applyStatusChange(supabase, {
      ticketId: id,
      nextStatus: isTicketStatus(body.status) ? body.status : undefined,
      extraPatch,
      performedBy: user.id,
    });

    if (!outcome.ok) {
      if (outcome.reason === 'not_found') {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }
      if (outcome.reason === 'conflict') {
        // Optimistic lock lost: someone else changed the ticket first.
        return NextResponse.json(
          { error: 'Ticket was modified by someone else. Reload and retry.' },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: outcome.data });
  } catch (error) {
    logServiceError({ service: 'Tickets', operation: 'update', error });
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const blocked =
      requireSameOrigin(request) ??
      rateLimit(request, { name: 'ticket-assign', limit: 30, windowMs: 60_000 });
    if (blocked) return blocked;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdminUser(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const parsed = await parseJsonBody(request);
    if ('response' in parsed) return parsed.response;
    const body = parsed.body;

    if (!body.assignedTo) {
      return NextResponse.json({ error: 'assignedTo is required' }, { status: 400 });
    }

    const assignee = await resolveAssignee(supabase, body.assignedTo);
    if (!assignee.ok || !assignee.value) {
      return NextResponse.json(
        { error: assignee.ok ? 'assignedTo is required' : assignee.message },
        { status: 400 },
      );
    }

    const { data: current, error: fetchError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const record = current as {
      status: string;
      version: number | null;
      assigned_to: string | null;
    };

    const { data, error } = await supabase
      .from('tickets')
      .update({
        assigned_to: assignee.value,
        status: record.status === 'open' ? 'in_progress' : record.status,
        version: (record.version ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('version', record.version ?? 0)
      .select()
      .single();

    if (error || !data) {
      logServiceError({ service: 'Tickets', operation: 'assign', error });
      return NextResponse.json(
        { error: 'Ticket was modified by someone else. Reload and retry.' },
        { status: 409 },
      );
    }

    const { error: auditError } = await supabase.from('ticket_audit_log').insert({
      ticket_id: id,
      action: 'assigned',
      old_value: JSON.stringify({ assigned_to: record.assigned_to }),
      new_value: JSON.stringify({ assigned_to: assignee.value }),
      performed_by: user.id,
    });
    if (auditError) {
      logServiceError({ service: 'Tickets', operation: 'auditAssign', error: auditError });
    }

    // Log implicit status transition when assignment triggers open->in_progress
    if (record.status === 'open' && (data as { status?: string }).status === 'in_progress') {
      const { error: transitionError } = await supabase.from('ticket_audit_log').insert({
        ticket_id: id,
        action: 'status_changed',
        old_value: JSON.stringify({ status: 'open' }),
        new_value: JSON.stringify({ status: 'in_progress' }),
        performed_by: user.id,
      });
      if (transitionError) {
        logServiceError({ service: 'Tickets', operation: 'auditTransition', error: transitionError });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logServiceError({ service: 'Tickets', operation: 'assign', error });
    return NextResponse.json({ error: 'Failed to assign ticket' }, { status: 500 });
  }
}
