import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH, POST } from './route';

// --- mocks ---
const { mockFrom, mockGetUser, mockSendEmail, mockLogError } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
  mockSendEmail: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

vi.mock('@/lib/resend', () => ({
  sendTicketStatusEmail: (...args: unknown[]) => mockSendEmail(...args) as Promise<unknown>,
}));

vi.mock('@/lib/errors', () => ({
  logServiceError: mockLogError,
}));

type Chain = {
  select: (cols: string) => Chain;
  eq: (c: string, v: unknown) => Chain | Promise<{ data: unknown; error: unknown }>;
  in: (c: string, ids: string[]) => Chain;
  is: (c: string, v: unknown) => Chain;
  single: () => Promise<{ data: unknown; error: unknown }>;
  order: (c: string, o: unknown) => Chain | Promise<{ data: unknown; error: unknown }>;
  update: (d: unknown) => Chain;
  insert: (d: unknown) => Promise<{ error: unknown }>;
};

function chain(over: Partial<Chain> = {}): Chain {
  return {
    select: () => chain(over),
    eq: () => chain(over),
    in: () => chain(over),
    is: () => chain(over),
    single: async () => ({ data: null, error: null }),
    order: () => chain(over),
    update: () => chain(over),
    insert: async () => ({ error: null }),
    ...over,
  };
}

const ctx = { params: Promise.resolve({ id: "t1" }) };
const TICKET = {
  id: 't1', ticket_number: 'T-001', user_id: 'u1', status: 'open',
  priority: 'high', assigned_to: null, version: 1, created_at: new Date().toISOString(),
};

function jsonReq(body: unknown): Request {
  return new Request('http://x/api/tickets/t1', { method: 'PATCH', body: JSON.stringify(body) });
}

describe('tickets/[id] GET', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockSendEmail.mockReset(); mockSendEmail.mockResolvedValue(undefined);
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  it('returns 401 unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await GET(new Request("http://x"), ctx); 
    expect(res.status).toBe(401);
  });

  it('returns 404 when ticket missing', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') return chain({ single: async () => ({ data: null, error: { message: 'nope' } }) });
      return chain();
    });
    const res = await GET(new Request("http://x"), ctx);
    expect(res.status).toBe(404);
  });

  it('returns 403 for non-owner non-admin', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') return chain({ single: async () => ({ data: { ...TICKET, user_id: 'someone-else' }, error: null }) });
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'customer' }, error: null }) });
      return chain();
    });
    const res = await GET(new Request("http://x"), ctx);
    expect(res.status).toBe(403);
  });

  it('returns ticket with attachments and comments for owner', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') return chain({ single: async () => ({ data: TICKET, error: null }) });
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'customer' }, error: null }) });
      if (table === 'ticket_attachments') return chain({ eq: async () => ({ data: [{ id: 'a1' }], error: null }) });
      if (table === 'ticket_comments') return chain({ eq: () => chain({ order: async () => ({ data: [{ id: 'c1' }], error: null }) }) });
      return chain();
    });
    const res = await GET(new Request("http://x"), ctx);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.attachments).toHaveLength(1);
    expect(body.data.comments).toHaveLength(1);
  });
});

describe('tickets/[id] PATCH', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockSendEmail.mockReset(); mockSendEmail.mockResolvedValue(undefined);
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  it('rejects invalid status and priority', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') return chain({ single: async () => ({ data: TICKET, error: null }) });
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      return chain();
    });
    const bad1 = await PATCH(jsonReq({ status: 'bogus' }), ctx);
    expect(bad1.status).toBe(400);
    const bad2 = await PATCH(jsonReq({ priority: 'bogus' }), ctx);
    expect(bad2.status).toBe(400);
  });

  it('updates status, writes audit log and emails owner', async () => {
    let auditInserts = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return chain({
          single: async () => ({ data: TICKET, error: null }),
          update: () => chain({ eq: () => chain({ eq: () => chain({ select: () => chain({ single: async () => ({ data: { ...TICKET, status: 'resolved', version: 2 }, error: null }) }) }) }) }),
        });
      }
      if (table === 'users') {
        // role lookup (u1) then owner email lookup — distinguish by caller
        return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      }
      if (table === 'ticket_audit_log') {
        return chain({
          insert: async () => {
            auditInserts++;
            return { error: null };
          },
        });
      }
      return chain();
    });
    // owner email lookup: the second users query must return an email — emulate via eq('id', 'owner1')
    const origImpl = mockFrom.getMockImplementation()!;
    mockFrom.mockImplementation((table: string) => {
      const c = origImpl(table);
      if (table === 'users') {
        return chain({
          single: async () => ({ data: { role: 'admin', email: 'owner@x.com' }, error: null }),
        });
      }
      return c;
    });
    const res = await PATCH(jsonReq({ status: 'resolved' }), ctx);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(auditInserts).toBe(1);
    expect(mockSendEmail).toHaveBeenCalledWith('owner@x.com', 'T-001', 'open', 'resolved');
  });

  it('returns 500 when update fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return chain({
          single: async () => ({ data: TICKET, error: null }),
          update: () => chain({ eq: () => chain({ eq: () => chain({ select: () => chain({ single: async () => ({ data: null, error: { message: 'x' } }) }) }) }) }),
        });
      }
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      return chain();
    });
    const res = await PATCH(jsonReq({ status: 'resolved' }), ctx);
    expect(res.status).toBe(500);
  });
});

describe('tickets/[id] POST (assign)', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin1' } } });
  });

  it('returns 403 for non-admin', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'customer' }, error: null }) });
      return chain();
    });
    const res = await POST(jsonReq({ assignedTo: 'a' }), ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 when assignedTo missing', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      return chain();
    });
    const res = await POST(jsonReq({}), ctx);
    expect(res.status).toBe(400);
  });

  it('assigns ticket and transitions open->in_progress with audit logs', async () => {
    let auditInserts = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return chain({ single: async () => ({ data: { role: 'admin' }, error: null }) });
      if (table === 'tickets') {
        return chain({
          single: async () => ({ data: TICKET, error: null }),
          update: () => chain({ eq: () => chain({ eq: () => chain({ select: () => chain({ single: async () => ({ data: { ...TICKET, assigned_to: 'agent1', status: 'in_progress', version: 2 }, error: null }) }) }) }) }),
        });
      }
      if (table === 'ticket_audit_log') {
        return chain({
          insert: async () => {
            auditInserts++;
            return { error: null };
          },
        });
      }
      return chain();
    });
    const res = await POST(jsonReq({ assignedTo: 'agent1' }), ctx);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(auditInserts).toBe(2); // assigned + status_changed
  });
});
