import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, GET } from './route';

// --- mocks ---
const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

vi.mock('@/lib/errors', () => ({
  logServiceError: vi.fn(),
}));

type Chain = {
  select: (cols: string) => Chain;
  eq: (c: string, v: unknown) => Chain | Promise<{ data: unknown; error: unknown }>;
  single: () => Promise<{ data: unknown; error: unknown }>;
  in: (c: string, ids: string[]) => Chain;
  is: (c: string, v: unknown) => Chain | Promise<{ data: unknown; error: unknown }>;
  update: (data: unknown) => Chain;
  insert: (data: unknown) => Promise<{ error: unknown }>;
  order: (col: string, opts: unknown) => Chain | Promise<{ data: unknown; error: unknown }>;
};

function chain(over: Partial<Chain> = {}): Chain {
  return {
    // every intermediate call re-emits the same chain so overrides (single, order, insert…) survive
    select: () => chain(over),
    eq: () => chain(over),
    single: async () => ({ data: null, error: null }),
    in: () => chain(over),
    is: () => chain(over),
    update: () => chain(over),
    insert: async () => ({ error: null }),
    order: async () => ({ data: [], error: null }),
    ...over,
  };
}

function jsonResponse(data: unknown, init?: { status: number }) {
  return new Response(JSON.stringify(data), {
    status: init?.status || 200,
    headers: { 'content-type': 'application/json' },
  });
}

async function readBody(res: Response) {
  return res.json();
}

describe('tickets/stats PATCH (bulk status)', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  it('rejects unauthenticated requests with 401', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await PATCH(new Request('http://x/api/tickets/stats', { method: 'PATCH', body: JSON.stringify({ ids: ['a'], status: 'resolved' }) }));
    expect(res.status).toBe(401);
  });

  it('rejects non-admin users with 403', async () => {
    mockFrom.mockReturnValue(chain({ single: async () => ({ data: { role: 'customer' }, error: null }) }));
    const res = await PATCH(new Request('http://x/api/tickets/stats', { method: 'PATCH', body: JSON.stringify({ ids: ['a'], status: 'resolved' }) }));
    expect(res.status).toBe(403);
  });

  it('rejects invalid payloads with 400', async () => {
    mockFrom.mockReturnValue(chain({ single: async () => ({ data: { role: 'admin' }, error: null }) }));
    const cases = [
      {},
      { ids: [], status: 'resolved' },
      { ids: 'nope', status: 'resolved' },
      { ids: Array.from({ length: 101 }, (_, i) => String(i)), status: 'resolved' },
      { ids: ['a'], status: 'invalid_status' },
    ];
    for (const body of cases) {
      const res = await PATCH(new Request('http://x/api/tickets/stats', { method: 'PATCH', body: JSON.stringify(body) }));
      expect(res.status).toBe(400);
    }
  });

  it('updates tickets and writes audit log for status changes', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      if (table === 'tickets') {
        // first from('tickets') call = select current statuses; second = update
        let fromCall = 0;
        return chain({
          select: () => {
            fromCall++;
            return chain({ in: () => chain({ is: async () => ({ data: [{ id: 't1', status: 'open' }], error: null }) }) });
          },
          update: () => chain({ in: () => chain({ is: async () => ({ data: null, error: null }) }) }),
        });
      }
      if (table === 'ticket_audit_log') {
        return chain({
          insert: async (data: unknown) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data).toHaveLength(1); // only t1 changes status
            return { error: null };
          },
        });
      }
      return chain();
    });
    const res = await PATCH(new Request('http://x/api/tickets/stats', { method: 'PATCH', body: JSON.stringify({ ids: ['t1', 't2'], status: 'resolved' }) }));
    const body = await readBody(res);
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns 500 when the update fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      if (table === 'tickets') {
        return chain({
          select: () => chain({ in: () => chain({ is: async () => ({ data: [{ id: 't1', status: 'open' }], error: null }) }) }),
          // update path: update().in().is() → error
          update: () => chain({ in: () => chain({ is: async () => ({ data: null, error: { message: 'db down' } }) }) }),
        });
      }
      return chain();
    });
    const res = await PATCH(new Request('http://x/api/tickets/stats', { method: 'PATCH', body: JSON.stringify({ ids: ['t1'], status: 'resolved' }) }));
    expect(res.status).toBe(500);
  });
});

describe('tickets/stats GET', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
  });

  it('rejects unauthenticated requests with 401', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns aggregated stats for admins', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin1' } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      if (table === 'tickets') {
        return chain({
          is: () => chain({
            order: async () => ({
              data: [
                { id: '1', ticket_number: 'T-1', subject: 'a', status: 'open', priority: 'high', category: 'build', created_at: new Date().toISOString() },
                { id: '2', ticket_number: 'T-2', subject: 'b', status: 'resolved', priority: 'low', category: 'run', created_at: new Date().toISOString() },
              ],
              error: null,
            }),
          }),
        });
      }
      return chain();
    });
    const res = await GET();
    const body = await readBody(res);
    expect(res.status).toBe(200);
    expect(body.data.total).toBe(2);
    expect(body.data.byStatus).toEqual({ open: 1, resolved: 1 });
    expect(body.data.byCategory).toEqual({ build: 1, run: 1 });
    expect(body.data.byPriority).toEqual({ high: 1, low: 1 });
    expect(body.data.recent).toHaveLength(2);
  });

  it('returns my-tickets stats for regular users', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'customer' }, error: null }) });
      if (table === 'tickets') {
        return chain({
          eq: () => chain({
            is: async () => ({
              data: [
                { status: 'open', category: 'build', created_at: new Date().toISOString() },
                { status: 'open', category: 'build', created_at: new Date().toISOString() },
              ],
              error: null,
            }),
          }),
        });
      }
      return chain();
    });
    const res = await GET();
    const body = await readBody(res);
    expect(res.status).toBe(200);
    expect(body.data.total).toBe(2);
    expect(body.data.byStatus).toEqual({ open: 2 });
    expect(body.data.byCategory).toEqual({ build: 2 });
  });
});

void jsonResponse;
