import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware';

const { mockIntl, mockUpdateSession } = vi.hoisted(() => ({
  // createMiddleware(config) must return a middleware function; use NextResponse
  // so .cookies API exists for the cookie-merge loop
  mockIntl: vi.fn(() => () => NextResponse.next({ headers: { 'set-cookie': 'a=1; Path=/' } })),
  mockUpdateSession: vi.fn(async () => ({
    cookies: { getAll: () => [{ name: 'sb', value: 'x', httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60, domain: undefined }] },
  })),
}));

vi.mock('next-intl/middleware', () => ({ default: mockIntl }));
vi.mock('@/lib/supabase/middleware', () => ({ updateSession: mockUpdateSession }));
vi.mock('@/i18n/config', () => ({ locales: ['en', 'zh'], defaultLocale: 'en' }));

describe('middleware', () => {
  it('merges supabase cookies into the intl response', async () => {
    const res = await middleware(new NextRequest('https://x/en'));
    expect(res).toBeInstanceOf(Response);
    expect(mockIntl).toHaveBeenCalled();
    expect(mockUpdateSession).toHaveBeenCalled();
  });

  it('propagates the supabase cookie onto the response', async () => {
    const res = await middleware(new NextRequest('https://x/en'));
    const cookies = res.cookies.getAll();
    const sbCookie = cookies.find(c => c.name === 'sb');
    expect(sbCookie).toBeTruthy();
    expect(sbCookie!.value).toBe('x');
  });
});
