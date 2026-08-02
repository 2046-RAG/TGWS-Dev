import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const { mockFrom, mockSend } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSend: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ from: mockFrom }),
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

vi.mock('@/lib/errors', () => ({ logServiceError: vi.fn() }));

function req(body: unknown): NextRequest {
  return new NextRequest('http://x/api/search/lead', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const VALID = {
  name: 'Alice',
  email: 'alice@example.com',
  searchQuery: 'kubernetes',
  gapDescription: 'No results found',
};

describe('search/lead POST', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: 'm1' }, error: null });
  });

  it('returns 400 for missing required fields', async () => {
    const cases = [
      {},
      { name: 'a' },
      { name: 'a', email: 'b@c.com' },
      { name: 'a', email: 'b@c.com', searchQuery: 'q' },
    ];
    for (const body of cases) {
      const res = await POST(req(body));
      expect(res.status).toBe(400);
    }
  });

  it('returns 400 for non-string fields', async () => {
    const res = await POST(req({ ...VALID, name: 123 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for over-length fields', async () => {
    const res = await POST(req({ ...VALID, name: 'x'.repeat(101) }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email', async () => {
    const res = await POST(req({ ...VALID, email: 'not-an-email' }));
    expect(res.status).toBe(400);
  });

  it('creates a lead and returns success', async () => {
    mockFrom.mockReturnValue({
      insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'lead1' }, error: null }) }) }),
    });
    const res = await POST(req(VALID));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.leadId).toBe('lead1');
    expect(mockFrom).toHaveBeenCalledWith('leads');
    // async emails fire
    await vi.waitFor(() => expect(mockSend.mock.calls.length).toBeGreaterThanOrEqual(1));
  });

  it('returns 500 when lead creation fails', async () => {
    mockFrom.mockReturnValue({
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'db' } }) }) }),
    });
    const res = await POST(req(VALID));
    expect(res.status).toBe(500);
  });
});
