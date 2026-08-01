import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { ids, status } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (ids.length > 100) {
      return NextResponse.json({ error: 'Too many tickets in one batch' }, { status: 400 });
    }

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch current statuses for audit log (exclude soft-deleted tickets)
    const { data: currentTickets } = await supabase
      .from('tickets')
      .select('id, status')
      .in('id', ids)
      .is('deleted_at', null);

    const { error } = await supabase
      .from('tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids)
      .is('deleted_at', null);

    if (error) {
      logServiceError({ service: 'Tickets', operation: 'bulkStatus', error });
      return NextResponse.json({ error: 'Failed to update tickets' }, { status: 500 });
    }

    // Bulk audit log for batch status update
    if (currentTickets && currentTickets.length > 0) {
      const auditEntries = (currentTickets as { id: string; status: string }[])
        .filter(t => t.status !== status)
        .map(t => ({
          ticket_id: t.id,
          action: 'status_changed',
          old_value: JSON.stringify({ status: t.status }),
          new_value: JSON.stringify({ status }),
          performed_by: user.id,
        }));
      if (auditEntries.length > 0) {
        const { error: auditError } = await supabase.from('ticket_audit_log').insert(auditEntries);
        if (auditError) {
          logServiceError({ service: 'Tickets', operation: 'auditBulkStatus', error: auditError });
        }
      }
    }

    return NextResponse.json({ success: true, updated: ids.length });
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
