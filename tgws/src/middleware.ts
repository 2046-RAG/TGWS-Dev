import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { locales, defaultLocale } from '@/i18n/config';
import {
  validateCsrfToken,
  isMutatingMethod,
  generateCsrfToken,
  CSRF_COOKIE_NAME,
  CSRF_COOKIE_OPTIONS,
} from '@/lib/csrf';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false
});

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const apiRoute = isApiRoute(pathname);

  // 1) CSRF check on mutating /api/* requests — runs BEFORE supabase
  //    updateSession so a forged request never reaches auth code.
  if (apiRoute && isMutatingMethod(request.method)) {
    if (!validateCsrfToken(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CSRF_INVALID',
            message: 'Invalid or missing CSRF token',
          },
        },
        { status: 403 }
      );
    }
  }

  // 2) Always run supabase updateSession (auth refresh, cookies, and
  //    /support/* route protection handled inside supabase middleware).
  const supabaseResponse = await updateSession(request);

  // 3) If supabase middleware issued a redirect (e.g., unauthenticated user
  //    hitting /support/*, or authenticated user hitting /support/login),
  //    honor it directly — intl middleware would just create a competing
  //    redirect and we'd lose the supabase cookies/headers.
  const supabaseStatus = supabaseResponse.status;
  const isSupabaseRedirect =
    supabaseStatus >= 300 && supabaseStatus < 400;

  // 4) For API routes: ensure a CSRF cookie is set (first visit / expired),
  //    then return the supabase response unchanged. Do NOT run intl middleware
  //    on /api/* — it would try to localize them and break the routes.
  if (apiRoute) {
    if (!request.cookies.get(CSRF_COOKIE_NAME)?.value) {
      supabaseResponse.cookies.set(
        CSRF_COOKIE_NAME,
        generateCsrfToken(),
        CSRF_COOKIE_OPTIONS
      );
    }
    return supabaseResponse;
  }

  // 5) Supabase-issued redirect on a non-API route: pass through as-is so the
  //    browser follows it (carrying the auth cookies supabase just set).
  if (isSupabaseRedirect) {
    return supabaseResponse;
  }

  // 6) For non-API routes: run intl middleware and merge supabase response
  //    (cookies + headers) into the intl response. The previous
  //    implementation only copied cookie name/value and LOST options like
  //    httpOnly / secure / sameSite / maxAge — that was a security bug.
  const intlResponse = intlMiddleware(request);

  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    intlResponse.cookies.set(name, value, options);
  });

  supabaseResponse.headers.forEach((value, key) => {
    // Don't override headers that intl middleware explicitly set.
    if (!intlResponse.headers.has(key)) {
      intlResponse.headers.set(key, value);
    }
  });

  return intlResponse;
}

export const config = {
  // Include /api/* paths so CSRF + supabase session refresh run on them.
  // Still exclude Next.js internals and static-ish dotted paths.
  matcher: ['/((?!_next|.*\\..*).*)']
};
