import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTicketCreatedEmail } from '@/lib/resend';
import { logServiceError } from '@/lib/errors';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
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

    if (typeof productService !== 'string' || productService.length > 100) {
      return NextResponse.json({ error: 'Product must be a string up to 100 characters' }, { status: 400 });
    }

    // Cryptographically-random suffix instead of Math.random() (AUDIT-025).
    const ticketNumber = `TG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 6).toUpperCase()}`;

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
      logServiceError({ service: 'Tickets', operation: 'create', error });
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    // Audit insert failure must not silently break the audit trail (PRD #17).
    const { error: auditError } = await supabase.from('ticket_audit_log').insert({
      ticket_id: data.id,
      action: 'created',
      new_value: JSON.stringify({ status: 'open' }),
      performed_by: user.id,
    });
    if (auditError) {
      logServiceError({ service: 'Tickets', operation: 'auditCreate', error: auditError });
    }

    // Send confirmation email (non-blocking, logged on failure)
    if (user.email) {
      sendTicketCreatedEmail(user.email, ticketNumber, subject, category).catch((err) => {
        logServiceError({ service: 'Resend', operation: 'ticketCreatedEmail', error: err });
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logServiceError({ service: 'Tickets', operation: 'create', error });
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
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

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      logServiceError({ service: 'Tickets', operation: 'list', error });
      return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logServiceError({ service: 'Tickets', operation: 'list', error });
    return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 });
  }
}
