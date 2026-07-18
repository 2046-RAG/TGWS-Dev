import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Public support routes that don't require authentication
const PUBLIC_SUPPORT_ROUTES = [
  '/support/login',
  '/support/register',
  '/support/reset-password',
];

// Auth routes that should redirect to /support when user is already logged in
const AUTH_SUPPORT_ROUTES = ['/support/login', '/support/register'];

function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first === 'en' || first === 'zh') {
    return first;
  }
  return 'en';
}

function getSupportPath(pathname: string): string {
  // Strip locale prefix (e.g. /en/support/login -> /support/login)
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'en' || segments[0] === 'zh') {
    segments.shift();
  }
  return '/' + segments.join('/');
}

function isSupportRoute(supportPath: string): boolean {
  return supportPath === '/support' || supportPath.startsWith('/support/');
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection: runs after session refresh so cookies are fresh
  const pathname = request.nextUrl.pathname;
  const supportPath = getSupportPath(pathname);
  const locale = getLocaleFromPathname(pathname);
  const search = request.nextUrl.search || '';

  if (isSupportRoute(supportPath)) {
    const isPublicRoute = PUBLIC_SUPPORT_ROUTES.some(
      (route) => supportPath === route
    );
    const isAuthRoute = AUTH_SUPPORT_ROUTES.some(
      (route) => supportPath === route
    );

    if (!user && !isPublicRoute) {
      // Unauthenticated user accessing protected support route -> redirect to login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/support/login`;
      redirectUrl.search = '';
      redirectUrl.searchParams.set('redirect', `${pathname}${search}`);
      return NextResponse.redirect(redirectUrl);
    }

    if (user && isAuthRoute) {
      // Authenticated user accessing login/register -> redirect to /support
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/support`;
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
