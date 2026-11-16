import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, GET } from './route';

// --- mocks ---
const { mockFrom, mockGetUser, mockRpc, mockSendEmail } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
  mockRpc: vi.fn(),
  mockSendEmail: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    rpc: mockRpc,
  }),
}));

vi.mock('@/lib/resend', () => ({
  sendTicketStatusEmail: (...args: unknown[]) => mockSendEmail(...args) as Promise<unknown>,
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

const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';

function bulkReq(body: unknown) {
  return new Request('http://x/api/tickets/stats', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * Mirrors what one `applyStatusChange` call hits: select the ticket, update it
 * with a version guard, then read the updated row. Deliberately free of shared
 * mutable state so concurrent calls (mapLimit) cannot interfere.
 */
function ticketTable(updateError: unknown = null) {
  return {
    select: () => ({
      eq: () => ({
        is: () => ({
          single: async () => ({
            data: { id: 't', ticket_number: 'T-1', user_id: 'u1', status: 'open', version: 1 },
            error: null,
          }),
        }),
      }),
    }),
    update: (payload: Record<string, unknown>) => ({
      eq: () => ({
        eq: () => ({
          select: () => ({
            single: async () =>
              updateError
                ? { data: null, error: updateError }
                : { data: { id: 't', status: payload.status }, error: null },
          }),
        }),
      }),
    }),
  };
}

describe('tickets/stats PATCH (bulk status)', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockRpc.mockReset();
    mockSendEmail.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockRpc.mockResolvedValue({ data: 'owner@x.com', error: null });
    mockSendEmail.mockResolvedValue(undefined);
  });

  it('rejects unauthenticated requests with 401', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await PATCH(bulkReq({ ids: [ID_A], status: 'resolved' }));
    expect(res.status).toBe(401);
  });

  it('rejects non-admin users with 403', async () => {
    mockFrom.mockReturnValue(
      chain({ single: async () => ({ data: { role: 'customer' }, error: null }) }),
    );
    const res = await PATCH(bulkReq({ ids: [ID_A], status: 'resolved' }));
    expect(res.status).toBe(403);
  });

  it('rejects invalid payloads with 400', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      }
      return chain();
    });

    for (const body of [
      {},
      { ids: [], status: 'resolved' },
      { ids: [ID_A], status: 'bogus' },
      { ids: ['not-a-uuid'], status: 'resolved' },
    ]) {
      const res = await PATCH(bulkReq(body));
      expect(res.status).toBe(400);
    }
  });

  it('applies the same transition to every ticket and reports real counts', async () => {
    let auditInserts = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      }
      if (table === 'tickets') return ticketTable();
      if (table === 'ticket_audit_log') {
        return {
          insert: async () => {
            auditInserts += 1;
            return { error: null };
          },
        };
      }
      return chain();
    });

    const res = await PATCH(bulkReq({ ids: [ID_A, ID_B], status: 'resolved' }));
    const body = await readBody(res);

    expect(res.status).toBe(200);
    expect(body.updated).toBe(2);
    expect(body.unchanged).toBe(0);
    expect(body.failed).toEqual([]);
    // G4: the bulk path must write the same audit trail as the single path.
    expect(auditInserts).toBe(2);
    // G4: and must notify the owner, which the old bulk path never did.
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
  });

  it('returns 500 when every ticket fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      }
      if (table === 'tickets') return ticketTable({ code: '42501', message: 'db down' });
      return chain();
    });

    const res = await PATCH(bulkReq({ ids: [ID_A], status: 'resolved' }));
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
