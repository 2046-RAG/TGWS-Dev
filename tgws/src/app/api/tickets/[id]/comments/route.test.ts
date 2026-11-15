import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const { mockFrom, mockGetUser, mockSendEmail, mockLogError } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
  mockSendEmail: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser }, from: mockFrom }),
}));
vi.mock('@/lib/resend', () => ({
  sendTicketReplyEmail: (...args: unknown[]) => mockSendEmail(...args) as Promise<unknown>,
}));
vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

const ctx = { params: Promise.resolve({ id: 't1' }) };
const TICKET = { id: 't1', user_id: 'u1', ticket_number: 'TG-1', subject: 'Broken switch' };

function req(body: unknown): Request {
  return new Request('http://x/api/tickets/t1/comments', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function setup(role: string, ownerId = 'u1') {
  const usersChain: Record<string, unknown> = {};
  usersChain.select = () => usersChain;
  usersChain.eq = () => usersChain;
  usersChain.single = async () => ({ data: { role }, error: null });
  usersChain.in = async () => ({ data: [], error: null });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'tickets') {
      return {
        select: () => ({
          eq: () => ({
            is: () => ({ single: async () => ({ data: { ...TICKET, user_id: ownerId }, error: null }) }),
          }),
        }),
      };
    }
    if (table === 'users') return usersChain;
    if (table === 'ticket_comments') {
      return {
        insert: () => ({
          select: () => ({ single: async () => ({ data: { id: 'c1' }, error: null }) }),
        }),
      };
    }
    if (table === 'ticket_audit_log') return { insert: async () => ({ error: null }) };
    return {};
  });
}

describe('POST /api/tickets/[id]/comments (T-060)', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockSendEmail.mockReset();
    mockLogError.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'cust@example.com' } } });
    mockSendEmail.mockResolvedValue(undefined);
  });

  it('returns 401 unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(req({ content: 'hi' }), ctx);
    expect(res.status).toBe(401);
  });

  it('returns 400 when content is missing', async () => {
    setup('customer');
    const res = await POST(req({}), ctx);
    expect(res.status).toBe(400);
  });

  it('returns 403 when a customer replies to someone else\'s ticket', async () => {
    setup('customer', 'someone-else');
    const res = await POST(req({ content: 'hi' }), ctx);
    expect(res.status).toBe(403);
  });

  it('returns 403 when a customer tries to write an internal note', async () => {
    setup('customer');
    const res = await POST(req({ content: 'hi', isInternal: true }), ctx);
    expect(res.status).toBe(403);
  });

  it('returns 201 for a customer replying to their own ticket', async () => {
    setup('customer');
    const res = await POST(req({ content: 'hello' }), ctx);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('returns 201 for an admin writing an internal note', async () => {
    setup('admin', 'someone-else');
    const res = await POST(req({ content: 'internal', isInternal: true }), ctx);
    expect(res.status).toBe(201);
    // internal notes must not trigger customer email
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
