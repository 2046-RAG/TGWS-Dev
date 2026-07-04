import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOdooLead } from '@/lib/odoo';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
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

  const supabase = await createClient();

  const { error: dbError } = await supabase
    .from('contact_submissions')
    .insert({ name, email, company, phone, message });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await createOdooLead({ name, email, company, phone, description: message });

  return NextResponse.json({ success: true });
}