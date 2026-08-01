import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/support/login`,
    });

    if (error) {
      // Log the real reason server-side; return a generic message to avoid
      // leaking account-enumeration / rate-limit hints (AUDIT-007).
      logServiceError({ service: 'Auth', operation: 'resetPassword', error });
    }

    // Always return success so the response doesn't reveal whether an email exists.
    return NextResponse.json({ success: true });
  } catch (error) {
    logServiceError({ service: 'Auth', operation: 'resetPassword', error });
    return NextResponse.json({ error: 'Failed to send reset link' }, { status: 500 });
  }
}
