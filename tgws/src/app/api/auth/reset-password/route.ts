import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';
import { rateLimit, requireSameOrigin, validateFields, parseJsonBody } from '@/lib/api-guard';

export async function POST(request: Request) {
  try {
    const blocked = requireSameOrigin(request) ?? rateLimit(request, { name: 'reset-password', limit: 3, windowMs: 60_000 });
    if (blocked) return blocked;

    const parsed = await parseJsonBody(request);
    if ('response' in parsed) return parsed.response;
    const body = parsed.body;
    const fieldError = validateFields(body, {
      email: { required: true, type: 'email', max: 254 },
    });
    if (fieldError) {
      return NextResponse.json({ error: fieldError }, { status: 400 });
    }
    const { email } = body as { email: string };

    // T-071: keep the locale of the page that triggered the request. The
    // browser-side form calls Supabase directly; this endpoint is the
    // server-side fallback, so it must send users to the same real page.
    const referer = request.headers.get('referer') || '';
    const locale = referer.match(/\/(en|zh)\//)?.[1] || 'en';
    const origin = new URL(request.url).origin;

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${origin}/${locale}/support/reset-password`,
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
