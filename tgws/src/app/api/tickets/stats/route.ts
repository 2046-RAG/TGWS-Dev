import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';
import { parseJsonBody, rateLimit, requireSameOrigin } from '@/lib/api-guard';
import { applyStatusChange, isTicketStatus } from '@/lib/tickets/status-change';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Keep bulk operations from opening hundreds of DB connections at once. */
const BULK_CONCURRENCY = 10;

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    out.push(...(await Promise.all(chunk.map(fn))));
  }
  return out;
}

export async function PATCH(request: Request) {
  try {
    // G14: bulk status changes mutate tickets, so they need the same origin +
    // rate limiting as the single-ticket path.
    const blocked =
      requireSameOrigin(request) ??
      rateLimit(request, { name: 'ticket-bulk-status', limit: 20, windowMs: 60_000 });
    if (blocked) return blocked;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userRole } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = (userRole as { role?: string } | null)?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = await parseJsonBody(request);
    if ('response' in parsed) return parsed.response;
    const { ids, status } = parsed.body as { ids?: unknown; status?: unknown };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (ids.length > 100) {
      return NextResponse.json({ error: 'Too many tickets in one batch' }, { status: 400 });
    }

    if (!ids.every((id): id is string => typeof id === 'string' && UUID_RE.test(id))) {
      return NextResponse.json({ error: 'Invalid ticket id in batch' }, { status: 400 });
    }

    if (!isTicketStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // G4/G5/G13: reuse the single-ticket transition so `resolved_at`, the audit
    // trail, the optimistic lock and the customer email cannot drift between
    // the two entry points. Results are reported per ticket instead of the old
    // `updated: ids.length`, which over-counted missing or unchanged rows.
    const outcomes = await mapLimit(ids, BULK_CONCURRENCY, (ticketId) =>
      applyStatusChange(supabase, {
        ticketId,
        nextStatus: status,
        performedBy: user.id,
      }),
    );

    const failed: { id: string; reason: string }[] = [];
    let updated = 0;
    let unchanged = 0;

    outcomes.forEach((outcome, index) => {
      const id = ids[index];
      if (!outcome.ok) {
        failed.push({ id, reason: outcome.reason });
        return;
      }
      if (outcome.changed) updated += 1;
      else unchanged += 1;
    });

    // If nothing could be written at all, surface a real error so the UI does
    // not report a successful batch that changed nothing.
    if (outcomes.length > 0 && outcomes.every((outcome) => !outcome.ok)) {
      return NextResponse.json(
        { error: 'Failed to update tickets', failed },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      updated,
      unchanged,
      failed,
    });
  } catch (error) {
    logServiceError({ service: 'Tickets', operation: 'bulkStatus', error });
    return NextResponse.json({ error: 'Failed to update tickets' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userRole } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin';

    if (isAdmin) {
      const { data: allTickets } = await supabase
        .from('tickets')
        .select('id, ticket_number, subject, status, priority, category, created_at, assigned_to')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      const byStatus: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      const byPriority: Record<string, number> = {};

      (allTickets || []).forEach((t) => {
        byStatus[t.status] = (byStatus[t.status] || 0) + 1;
        byCategory[t.category] = (byCategory[t.category] || 0) + 1;
        byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      });

      const totalAgeDays = (allTickets || []).reduce((acc, t) => {
        const created = new Date(t.created_at).getTime();
        return acc + (Date.now() - created) / (1000 * 60 * 60 * 24);
      }, 0);

      return NextResponse.json({
        success: true,
        data: {
          total: allTickets?.length || 0,
          byStatus,
          byCategory,
          byPriority,
          avgAgeDays: allTickets?.length ? Math.round(totalAgeDays / allTickets.length) : 0,
          recent: (allTickets || []).slice(0, 5),
        },
      });
    }

    const { data: myTickets } = await supabase
      .from('tickets')
      .select('status, category, created_at')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    (myTickets || []).forEach((t) => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        total: myTickets?.length || 0,
        byStatus,
        byCategory,
      },
    });
  } catch (error) {
    logServiceError({ service: 'Tickets', operation: 'stats', error });
    return NextResponse.json({ error: 'Failed to load statistics' }, { status: 500 });
  }
}
