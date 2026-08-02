import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

const { mockExchangeCode, mockLogError } = vi.hoisted(() => ({
  mockExchangeCode: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession: mockExchangeCode } }),
}));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

function req(url: string): Request {
  return new Request(url);
}

describe('api/auth/callback GET', () => {
  beforeEach(() => {
    mockExchangeCode.mockReset();
    mockLogError.mockReset();
  });

  it('exchanges code and redirects to safe next path', async () => {
    mockExchangeCode.mockResolvedValue({ error: null });
    const res = await GET(req('https://site/api/auth/callback?code=abc&next=/support'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://site/support');
    expect(mockExchangeCode).toHaveBeenCalledWith('abc');
  });

  it('defaults next to /support when absent', async () => {
    mockExchangeCode.mockResolvedValue({ error: null });
    const res = await GET(req('https://site/api/auth/callback?code=abc'));
    expect(res.headers.get('location')).toBe('https://site/support');
  });

  it('blocks open-redirect with external URL', async () => {
    mockExchangeCode.mockResolvedValue({ error: null });
    const res = await GET(req('https://site/api/auth/callback?code=abc&next=https://evil.com'));
    expect(res.headers.get('location')).toBe('https://site/support');
  });

  it('blocks protocol-relative and backslash URLs', async () => {
    mockExchangeCode.mockResolvedValue({ error: null });
    for (const next of ['//evil.com', '/\\evil.com', '%2F%2Fevil.com']) {
      const res = await GET(req(`https://site/api/auth/callback?code=abc&next=${next}`));
      expect(res.headers.get('location')).toBe('https://site/support');
    }
  });

  it('redirects to login on exchange error', async () => {
    mockExchangeCode.mockResolvedValue({ error: { message: 'bad code' } });
    const res = await GET(req('https://site/api/auth/callback?code=bad'));
    expect(res.headers.get('location')).toBe('https://site/support/login?error=auth_failed');
    expect(mockLogError).toHaveBeenCalled();
  });

  it('redirects to login when code missing', async () => {
    const res = await GET(req('https://site/api/auth/callback'));
    expect(res.headers.get('location')).toBe('https://site/support/login?error=auth_failed');
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({ error: 'missing code param' }));
  });

  it('redirects to login when exchange throws', async () => {
    mockExchangeCode.mockRejectedValue(new Error('network'));
    const res = await GET(req('https://site/api/auth/callback?code=abc'));
    expect(res.headers.get('location')).toBe('https://site/support/login?error=auth_failed');
  });
});
