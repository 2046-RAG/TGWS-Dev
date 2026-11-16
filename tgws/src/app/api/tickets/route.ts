import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTicketCreatedEmail } from '@/lib/resend';
import { logServiceError } from '@/lib/errors';
import { randomUUID } from 'crypto';
import { rateLimit, requireSameOrigin, validateFields } from '@/lib/api-guard';

export async function POST(request: Request) {
  try {
    const blocked = requireSameOrigin(request) ?? rateLimit(request, { name: 'tickets-create', limit: 10, windowMs: 60_000 });
    if (blocked) return blocked;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const fieldError = validateFields(body, {
      category: { required: true },
      productService: { required: true, max: 100 },
      subject: { required: true, max: 200 },
      description: { required: true, max: 800 },
    });
    if (fieldError) {
      return NextResponse.json({ error: fieldError }, { status: 400 });
    }

    const { category, productService, subject, description, occurredAt } = body as {
      category: string;
      productService: string;
      subject: string;
      description: string;
      occurredAt?: string;
    };

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

    // G16: an unparseable timestamp used to reach Postgres and surface as a
    // 500. Validate the shape and a sane range here instead.
    let occurredAtValue: string | null = null;
    if (occurredAt !== undefined && occurredAt !== null && occurredAt !== '') {
      const parsedAt = Date.parse(String(occurredAt));
      const earliest = Date.UTC(2000, 0, 1);
      const latest = Date.now() + 24 * 60 * 60 * 1000; // tolerate clock skew
      if (!Number.isFinite(parsedAt) || parsedAt < earliest || parsedAt > latest) {
        return NextResponse.json({ error: 'Invalid occurredAt' }, { status: 400 });
      }
      occurredAtValue = new Date(parsedAt).toISOString();
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
        occurred_at: occurredAtValue,
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

export async function GET(request?: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request ? new URL(request.url) : null;

    // Default path is intentionally unchanged: a customer only ever sees
    // their own tickets. Existing unit tests also rely on this exact chain.
    if (!url || url.searchParams.get('scope') !== 'all') {
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
    }

    // T-058: admin-only "all customers' tickets" scope.
    const { data: roleRow, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (roleError) {
      logServiceError({ service: 'Tickets', operation: 'roleLookup', error: roleError });
    }
    const role = (roleRow as { role?: string } | null)?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allowed: Record<string, string[]> = {
      status: ['open', 'in_progress', 'resolved', 'closed'],
      category: ['build', 'run', 'protect'],
      priority: ['low', 'medium', 'high', 'critical'],
    };
    for (const key of Object.keys(allowed)) {
      const value = url.searchParams.get(key);
      if (value && !allowed[key].includes(value)) {
        return NextResponse.json({ error: `Invalid ${key}` }, { status: 400 });
      }
    }

    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const from = (page - 1) * limit;

    let query = supabase
      .from('tickets')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const priority = url.searchParams.get('priority');
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (priority) query = query.eq('priority', priority);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      logServiceError({ service: 'Tickets', operation: 'listAll', error });
      return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    logServiceError({ service: 'Tickets', operation: 'list', error });
    return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 });
  }
}
