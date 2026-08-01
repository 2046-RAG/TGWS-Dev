import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logServiceError } from '@/lib/errors';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/support';

  // Prevent Open Redirect: only allow relative paths on same origin.
  // Reject backslash + decode-then-recheck so encoded variants can't bypass
  // the guard (AUDIT-005).
  const decoded = decodeURIComponent(next);
  const safeNext =
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.startsWith('/\\') &&
    !decoded.startsWith('//') &&
    !decoded.startsWith('/\\')
      ? next
      : '/support';

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
      logServiceError({ service: 'Auth', operation: 'exchangeCode', error });
    } catch (error) {
      logServiceError({ service: 'Auth', operation: 'exchangeCode', error });
    }
  } else {
    logServiceError({ service: 'Auth', operation: 'callback', error: 'missing code param' });
  }

  return NextResponse.redirect(`${origin}/support/login?error=auth_failed`);
}
