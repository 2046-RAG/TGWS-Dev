import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOdooLead } from '@/lib/odoo';
import { logServiceError } from '@/lib/errors';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (typeof name === 'string' && name.length > 100) {
      return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 });
    }

    if (typeof message === 'string' && message.length > 5000) {
      return NextResponse.json({ error: 'Message must be 5000 characters or less' }, { status: 400 });
    }

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
