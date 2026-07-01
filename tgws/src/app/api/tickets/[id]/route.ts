import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { data: userRole } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin';
  if (!isAdmin && ticket.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: attachments } = await supabase
    .from('ticket_attachments')
    .select('*')
    .eq('ticket_id', id);

  const { data: comments } = await supabase
    .from('ticket_comments')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  return NextResponse.json({
    success: true,
    data: { ...ticket, attachments: attachments || [], comments: comments || [] },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const { data: current } = await supabase.from('tickets').select('*').eq('id', id).single();

  if (!current) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const { data: userRole } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin';
  if (!isAdmin && current.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('tickets')
    .update({
      status: body.status,
      priority: body.priority,
      assigned_to: body.assignedTo,
      version: (current?.version || 0) + 1,
      updated_at: new Date().toISOString(),
      ...(body.status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}),
    })
    .eq('id', id)
    .eq('version', current?.version)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('ticket_audit_log').insert({
    ticket_id: id,
    action: 'status_changed',
    old_value: JSON.stringify({ status: current?.status }),
    new_value: JSON.stringify({ status: body.status }),
    performed_by: user.id,
  });

  return NextResponse.json({ success: true, data });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  if (!body.assignedTo) {
    return NextResponse.json({ error: 'assignedTo is required' }, { status: 400 });
  }

  const { data: current } = await supabase.from('tickets').select('*').eq('id', id).single();

  if (!current) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('tickets')
    .update({
      assigned_to: body.assignedTo,
      status: current.status === 'open' ? 'in_progress' : current.status,
      version: (current.version || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('version', current.version)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('ticket_audit_log').insert({
    ticket_id: id,
    action: 'assigned',
    old_value: JSON.stringify({ assigned_to: current.assigned_to }),
    new_value: JSON.stringify({ assigned_to: body.assignedTo }),
    performed_by: user.id,
  });

  return NextResponse.json({ success: true, data });
}