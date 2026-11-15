import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route';

const { mockFrom, mockGetUser, mockSendCreated, mockLogError } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
  mockSendCreated: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

vi.mock('@/lib/resend', () => ({
  sendTicketCreatedEmail: (...args: unknown[]) => mockSendCreated(...args) as Promise<unknown>,
}));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

function req(body: unknown): Request {
  return new Request('http://x/api/tickets', { method: 'POST', body: JSON.stringify(body) });
}

const VALID = {
  category: 'run',
  productService: 'vSphere',
  subject: 'Cannot deploy VM',
  description: 'VM fails to start with error 5',
  occurredAt: null,
};

describe('tickets POST (create)', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockSendCreated.mockReset();
    mockLogError.mockReset();
    mockSendCreated.mockResolvedValue(undefined);
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u@x.com' } } });
  });

  it('returns 401 unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(req(VALID));
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing fields', async () => {
    const res = await POST(req({ category: 'run' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid category', async () => {
    const res = await POST(req({ ...VALID, category: 'bogus' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for over-length subject', async () => {
    const res = await POST(req({ ...VALID, subject: 'x'.repeat(201) }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for over-length description', async () => {
    const res = await POST(req({ ...VALID, description: 'x'.repeat(801) }));
    expect(res.status).toBe(400);
  });

  it('creates ticket with audit log and email', async () => {
    const inserted: Record<string, unknown>[] = [];
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return {
          insert: (data: Record<string, unknown>) => {
            inserted.push(data);
            return { select: () => ({ single: async () => ({ data: { id: 'tk1', ...data }, error: null }) }) };
          },
        };
      }
      if (table === 'ticket_audit_log') {
        return { insert: async () => ({ error: null }) };
      }
      return {};
    });
    const res = await POST(req(VALID));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(inserted[0].ticket_number).toMatch(/^TG-\d{8}-[A-F0-9]{6}$/);
    expect(mockSendCreated).toHaveBeenCalledWith('u@x.com', expect.any(String), 'Cannot deploy VM', 'run');
  });

  it('returns 500 when insert fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return { insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'db' } }) }) }) };
      }
      return {};
    });
    const res = await POST(req(VALID));
    expect(res.status).toBe(500);
  });
});

describe('tickets GET (list)', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockLogError.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  it('returns 401 unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns user tickets', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return {
          select: () => ({
            eq: () => ({
              is: () => ({
                order: async () => ({ data: [{ id: 't1', subject: 'x' }], error: null }),
              }),
            }),
          }),
        };
      }
      return {};
    });
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it('returns 500 on list error', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return {
          select: () => ({
            eq: () => ({
              is: () => ({
                order: async () => ({ data: null, error: { message: 'db' } }),
              }),
            }),
          }),
        };
      }
      return {};
    });
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe('tickets GET scope=all (T-058)', () => {
  type AdminChain = {
    select: () => AdminChain;
    is: () => AdminChain;
    eq: () => AdminChain;
    order: () => AdminChain;
    range: () => Promise<{ data: unknown[]; error: unknown; count: number }>;
  };

  const adminQuery = (rows: unknown[]): AdminChain => {
    const c: AdminChain = {
      select: () => c,
      is: () => c,
      eq: () => c,
      order: () => c,
      range: async () => ({ data: rows, error: null, count: rows.length }),
    };
    return c;
  };

  const withRole = (role: string, rows: unknown[] = []) => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({ single: async () => ({ data: { role }, error: null }) }),
          }),
        };
      }
      if (table === 'tickets') return adminQuery(rows);
      return {};
    });
  };

  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockLogError.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
  });

  it('returns 403 for a normal customer requesting all tickets', async () => {
    withRole('customer');
    const res = await GET(new Request('http://x/api/tickets?scope=all'));
    expect(res.status).toBe(403);
  });

  it('returns all tickets with pagination metadata for an admin', async () => {
    withRole('admin', [{ id: 't1', subject: 'a' }, { id: 't2', subject: 'b' }]);
    const res = await GET(new Request('http://x/api/tickets?scope=all&page=2&limit=5'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.total).toBe(2);
    expect(body.page).toBe(2);
    expect(body.limit).toBe(5);
  });

  it('rejects an invalid status filter', async () => {
    withRole('admin');
    const res = await GET(new Request('http://x/api/tickets?scope=all&status=nope'));
    expect(res.status).toBe(400);
  });

  it('default scope is unchanged and still filters by user_id', async () => {
    const eqCalls: [string, unknown][] = [];
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return {
          select: () => ({
            eq: (col: string, val: unknown) => {
              eqCalls.push([col, val]);
              return { is: () => ({ order: async () => ({ data: [{ id: 'own' }], error: null }) }) };
            },
          }),
        };
      }
      return {};
    });
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.total).toBeUndefined();
    expect(eqCalls).toEqual([['user_id', 'admin-1']]);
    // the default path must not perform a role lookup
    expect(mockFrom).not.toHaveBeenCalledWith('users');
  });
});
