import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

const { mockFrom, mockGetUser, mockLogError } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser }, from: mockFrom }),
}));
vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

describe('GET /api/admin/users (T-059)', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockLogError.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
  });

  it('returns 401 unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 403 for a normal customer', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'customer' }, error: null }) }) }),
        };
      }
      return {};
    });
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('returns staff list for an admin', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        const chain: Record<string, unknown> = {};
        chain.select = () => chain;
        chain.eq = () => chain;
        chain.in = () => chain;
        chain.is = () => chain;
        chain.order = async () => ({
          data: [{ id: 'admin-1', email: 'a@example.com', role: 'admin' }],
          error: null,
        });
        chain.single = async () => ({ data: { role: 'admin' }, error: null });
        return chain;
      }
      return {};
    });
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });
});
