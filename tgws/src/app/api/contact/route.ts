import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOdooLead } from '@/lib/odoo';
import { logServiceError } from '@/lib/errors';
import { rateLimit, requireSameOrigin, validateFields } from '@/lib/api-guard';

export async function POST(request: Request) {
  try {
    const blocked = requireSameOrigin(request) ?? rateLimit(request, { name: 'contact', limit: 5, windowMs: 60_000 });
    if (blocked) return blocked;

    const body = await request.json();
    const fieldError = validateFields(body, {
      name: { required: true, type: 'string', max: 100 },
      email: { required: true, type: 'email', max: 254 },
      company: { max: 100 },
      phone: { max: 40 },
      message: { required: true, type: 'string', max: 5000 },
    });
    if (fieldError) {
      return NextResponse.json({ error: fieldError }, { status: 400 });
    }

    const { name, email, company, phone, message } = body as {
      name: string;
      email: string;
      company?: string;
      phone?: string;
      message: string;
    };

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({ name, email, company, phone, message });

    if (dbError) {
      logServiceError({ service: 'Contact', operation: 'submit', error: dbError });
      return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
    }

    try {
      await createOdooLead({ name, email, company, phone, description: message });
    } catch (odooError) {
      // Lead was saved to Supabase; Odoo sync failure is logged but not fatal.
      logServiceError({ service: 'Odoo', operation: 'createLead', error: odooError });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logServiceError({ service: 'Contact', operation: 'submit', error });
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}
