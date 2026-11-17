import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';

const { mockSelect, mockLogError } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({ select: mockSelect }),
  }),
}));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

describe('keepalive cron', () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CRON_SECRET;
    mockSelect.mockReturnValue({ limit: async () => ({ error: null }) });
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
  });

  it('rejects a plain request without the Vercel cron header', async () => {
    const res = await GET(new Request('http://localhost/api/cron/keepalive'));
    expect(res.status).toBe(401);
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it('allows a Vercel cron invocation and performs a DB query', async () => {
    const res = await GET(
      new Request('http://localhost/api/cron/keepalive', {
        headers: { 'x-vercel-cron': '1' },
      }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(mockSelect).toHaveBeenCalledWith('id');
  });

  it('allows the bearer secret when configured', async () => {
    process.env.CRON_SECRET = 'test-secret';
    const res = await GET(
      new Request('http://localhost/api/cron/keepalive', {
        headers: { authorization: 'Bearer test-secret' },
      }),
    );
    expect(res.status).toBe(200);
  });

  it('returns 500 when the DB query fails', async () => {
    mockSelect.mockReturnValue({ limit: async () => ({ error: new Error('db down') }) });
    const res = await GET(
      new Request('http://localhost/api/cron/keepalive', {
        headers: { 'x-vercel-cron': '1' },
      }),
    );
    expect(res.status).toBe(500);
    expect(mockLogError).toHaveBeenCalled();
  });
});
