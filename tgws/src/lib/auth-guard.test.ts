import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth, requireAdmin, redirectIfAuthenticated } from './auth-guard';

const { mockGetUser, mockFrom, mockRedirect } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

function authed(role: string | null) {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u@x.com' } } });
  mockFrom.mockReturnValue({
    select: () => ({ eq: () => ({ single: async () => ({ data: role ? { role } : null, error: null }) }) }),
  });
}

describe('auth-guard', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockRedirect.mockClear();
  });

  it('requireAuth returns user when authenticated', async () => {
    authed('customer');
    const user = await requireAuth();
    expect(user.id).toBe('u1');
    expect(user.role).toBe('customer');
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('requireAuth redirects to login when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    await requireAuth();
    expect(mockRedirect).toHaveBeenCalledWith('/support/login');
  });

  it('requireAuth defaults role to user when lookup fails', async () => {
    authed(null);
    const user = await requireAuth();
    expect(user.role).toBe('user');
  });

  it('requireAdmin allows admin role', async () => {
    authed('admin');
    const user = await requireAdmin();
    expect(user.role).toBe('admin');
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('requireAdmin allows super_admin role', async () => {
    authed('super_admin');
    const user = await requireAdmin();
    expect(user.role).toBe('super_admin');
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('requireAdmin redirects non-admin to support', async () => {
    authed('customer');
    await requireAdmin();
    expect(mockRedirect).toHaveBeenCalledWith('/support');
  });

  it('redirectIfAuthenticated redirects logged-in users to support', async () => {
    authed('customer');
    await redirectIfAuthenticated();
    expect(mockRedirect).toHaveBeenCalledWith('/support');
  });

  it('redirectIfAuthenticated passes through for guests', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    await redirectIfAuthenticated();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
