import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTicketCreatedEmail } from '@/lib/resend';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { category, productService, subject, description, occurredAt } = body;

  if (!category || !productService || !subject || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const VALID_CATEGORIES = ['build', 'run', 'protect'];
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  if (typeof subject !== 'string' || subject.length > 200) {
    return NextResponse.json({ error: 'Subject must be a string up to 200 characters' }, { status: 400 });
  }

  if (typeof description !== 'string' || description.length > 800) {
    return NextResponse.json({ error: 'Description must be a string up to 800 characters' }, { status: 400 });
  }

  const ticketNumber = `TG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      user_id: user.id,
      ticket_number: ticketNumber,
      category,
      product_service: productService,
      subject,
      description,
      occurred_at: occurredAt || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('ticket_audit_log').insert({
    ticket_id: data.id,
    action: 'created',
    new_value: JSON.stringify({ status: 'open' }),
    performed_by: user.id,
  });

  // Send confirmation email (non-blocking)
  if (user.email) {
    sendTicketCreatedEmail(user.email, ticketNumber, subject, category).catch(() => {});
  }

  return NextResponse.json({ success: true, data });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}