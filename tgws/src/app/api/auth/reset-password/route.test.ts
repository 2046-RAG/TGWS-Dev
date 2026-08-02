import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const { mockResetPassword, mockLogError } = vi.hoisted(() => ({
  mockResetPassword: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { resetPasswordForEmail: mockResetPassword } }),
}));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

function req(body: unknown): Request {
  return new Request('http://x/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) });
}

describe('api/auth/reset-password POST', () => {
  beforeEach(() => {
    mockResetPassword.mockReset();
    mockLogError.mockReset();
    mockResetPassword.mockResolvedValue({ error: null });
  });

  it('returns 400 when email missing', async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email', async () => {
    const res = await POST(req({ email: 'nope' }));
    expect(res.status).toBe(400);
  });

  it('resets password with lowercased email and returns success', async () => {
    const res = await POST(req({ email: 'User@Example.COM' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockResetPassword).toHaveBeenCalledWith('user@example.com', expect.objectContaining({ redirectTo: expect.any(String) }));
  });

  it('always returns success even when reset errors (no enumeration)', async () => {
    mockResetPassword.mockResolvedValue({ error: { message: 'user not found' } });
    const res = await POST(req({ email: 'ghost@x.com' }));
    expect(res.status).toBe(200);
    expect(mockLogError).toHaveBeenCalled();
  });

  it('returns 500 when the request fails', async () => {
    mockResetPassword.mockRejectedValue(new Error('down'));
    const res = await POST(req({ email: 'a@b.com' }));
    expect(res.status).toBe(500);
  });
});
