import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

const { mockFrom, mockCreateOdooLead, mockLogError } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockCreateOdooLead: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ from: mockFrom }),
}));

vi.mock('@/lib/odoo', () => ({ createOdooLead: mockCreateOdooLead }));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

function req(body: unknown): Request {
  return new Request('http://x/api/contact', { method: 'POST', body: JSON.stringify(body) });
}

const VALID = { name: 'Jane', email: 'jane@example.com', company: 'ACME', phone: '123', message: 'Hello' };

describe('api/contact POST', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockCreateOdooLead.mockReset();
    mockFrom.mockReturnValue({ insert: async () => ({ error: null }) });
    mockCreateOdooLead.mockResolvedValue(undefined);
  });

  it('returns 400 for missing required fields', async () => {
    const cases = [{}, { name: 'a' }, { name: 'a', email: 'b@c.com' }];
    for (const body of cases) {
      const res = await POST(req(body));
      expect(res.status).toBe(400);
    }
  });

  it('returns 400 for invalid email', async () => {
    const res = await POST(req({ ...VALID, email: 'not-an-email' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for over-length name', async () => {
    const res = await POST(req({ ...VALID, name: 'x'.repeat(101) }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for over-length message', async () => {
    const res = await POST(req({ ...VALID, message: 'x'.repeat(5001) }));
    expect(res.status).toBe(400);
  });

  it('saves to supabase and creates Odoo lead on success', async () => {
    const res = await POST(req(VALID));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('contact_submissions');
    expect(mockCreateOdooLead).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane' }));
  });

  it('returns 500 when supabase insert fails', async () => {
    mockFrom.mockReturnValue({ insert: async () => ({ error: { message: 'db' } }) });
    const res = await POST(req(VALID));
    expect(res.status).toBe(500);
  });

  it('still succeeds when Odoo sync fails (non-fatal)', async () => {
    mockCreateOdooLead.mockRejectedValue(new Error('odoo down'));
    const res = await POST(req(VALID));
    expect(res.status).toBe(200);
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({ service: 'Odoo' }));
  });

  it('returns 500 when request parsing fails', async () => {
    const badReq = new Request('http://x/api/contact', { method: 'POST', body: 'not-json' });
    const res = await POST(badReq);
    expect(res.status).toBe(500);
  });
});
