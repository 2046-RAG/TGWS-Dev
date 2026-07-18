import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { NextResponse } from 'next/server';
import { updateSession } from '../middleware';

// Mock @supabase/ssr before importing the module under test so the same mock
// is used by the module-level createServerClient call.
const mockAuthGetUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockAuthGetUser,
    },
  })),
}));

function createRequest(pathname: string, search = '') {
  const url = `https://example.com${pathname}${search}`;
  return new NextRequest(url, {
    method: 'GET',
    headers: new Headers({ host: 'example.com' }),
  });
}

describe('supabase middleware updateSession — route protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no logged-in user
    mockAuthGetUser.mockResolvedValue({ data: { user: null } });
  });

  it('redirects unauthenticated /en/support to /en/support/login with redirect param', async () => {
    const request = createRequest('/en/support');
    const response = await updateSession(request) as NextResponse;

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).not.toBeNull();
    expect(location).toContain('/en/support/login');
    expect(location).toContain('redirect=%2Fen%2Fsupport');
  });

  it('redirects unauthenticated /zh/support to /zh/support/login', async () => {
    const request = createRequest('/zh/support');
    const response = await updateSession(request) as NextResponse;

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).not.toBeNull();
    expect(location).toContain('/zh/support/login');
    expect(location).toContain('redirect=%2Fzh%2Fsupport');
  });

  it('preserves original path + search in redirect param for nested protected routes', async () => {
    const request = createRequest('/en/support/tickets', '?status=open');
    const response = await updateSession(request) as NextResponse;

    expect(response.status).toBe(307);
    const location = response.headers.get('location') ?? '';
    expect(location).toContain('/en/support/login');
    // The redirect param should include the original pathname + search
    expect(location).toMatch(/redirect=%2Fen%2Fsupport%2Ftickets%3Fstatus%3Dopen/);
  });

  it('allows unauthenticated access to /en/support/login', async () => {
    const request = createRequest('/en/support/login');
    const response = await updateSession(request) as NextResponse;

    // Not a redirect: status should be 200 (NextResponse.next default)
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows unauthenticated access to /zh/support/register', async () => {
    const request = createRequest('/zh/support/register');
    const response = await updateSession(request) as NextResponse;

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows unauthenticated access to /en/support/reset-password', async () => {
    const request = createRequest('/en/support/reset-password');
    const response = await updateSession(request) as NextResponse;

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects authenticated /en/support/login to /en/support', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'test@test.com' } },
    });

    const request = createRequest('/en/support/login');
    const response = await updateSession(request) as NextResponse;

    expect(response.status).toBe(307);
    const location = response.headers.get('location') ?? '';
    expect(location).toContain('/en/support');
    // Must NOT contain /login suffix on the destination
    expect(location).not.toMatch(/\/support\/login/);
  });

  it('redirects authenticated /zh/support/register to /zh/support', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'test@test.com' } },
    });

    const request = createRequest('/zh/support/register');
    const response = await updateSession(request) as NextResponse;

    expect(response.status).toBe(307);
    const location = response.headers.get('location') ?? '';
    expect(location).toContain('/zh/support');
    expect(location).not.toMatch(/\/support\/register/);
  });

  it('lets authenticated user access /en/support without redirect', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'test@test.com' } },
    });

    const request = createRequest('/en/support');
    const response = await updateSession(request) as NextResponse;

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('lets authenticated user access /en/support/reset-password (so they can update their own password)', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'test@test.com' } },
    });

    const request = createRequest('/en/support/reset-password');
    const response = await updateSession(request) as NextResponse;

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('does not apply route protection to non-support routes (e.g. /en/products)', async () => {
    const request = createRequest('/en/products');
    const response = await updateSession(request) as NextResponse;

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});
