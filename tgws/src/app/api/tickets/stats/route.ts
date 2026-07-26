import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
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

  if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { error } = await supabase
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: ids.length });
}

export async function GET() {
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
      .select('status, category, priority, created_at')
      .is('deleted_at', null);

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    (allTickets || []).forEach((t) => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        total: allTickets?.length || 0,
        byStatus,
        byCategory,
        byPriority,
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
}