import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const { mockRevalidatePath, mockRevalidateTag, mockLogError } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockRevalidateTag: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: mockRevalidateTag,
}));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

function req(body: unknown, secret: string | null): NextRequest {
  const headers: Record<string, string> = {};
  if (secret !== null) headers['x-revalidate-secret'] = secret;
  return new NextRequest('http://x/api/revalidate', {
    method: 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('api/revalidate POST', () => {
  beforeEach(() => {
    process.env.REVALIDATE_SECRET = 'correct-secret';
    mockRevalidatePath.mockReset();
    mockRevalidateTag.mockReset();
  });
  afterEach(() => {
    delete process.env.REVALIDATE_SECRET;
  });

  it('returns 401 with no secret', async () => {
    const res = await POST(req({}, null));
    expect(res.status).toBe(401);
  });

  it('returns 401 with wrong secret', async () => {
    const res = await POST(req({}, 'wrong'));
    expect(res.status).toBe(401);
  });

  it('returns 401 when secret not configured server-side', async () => {
    delete process.env.REVALIDATE_SECRET;
    const res = await POST(req({}, 'correct-secret'));
    expect(res.status).toBe(401);
  });

  it('revalidates content paths for a known _type', async () => {
    const res = await POST(req({ _type: 'post', _id: 'p1' }, 'correct-secret'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.revalidated).toBe(true);
    expect(body.paths).toEqual(['/en/blog', '/zh/blog']);
    expect(mockRevalidateTag).toHaveBeenCalledWith('post', { expire: 3600 });
    // layout revalidation
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('revalidates all locale paths for unknown _type', async () => {
    const res = await POST(req({ _type: 'mystery', _id: 'x' }, 'correct-secret'));
    const body = await res.json();
    expect(body.paths).toEqual(['/en', '/zh']);
  });

  it('falls back to about/home paths when no body', async () => {
    const res = await POST(req(undefined, 'correct-secret'));
    const body = await res.json();
    expect(body.paths).toContain('/en/about');
    expect(body.paths).toContain('/en/home');
    // no body → no tag revalidation
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it('collects failures and reports revalidated=false', async () => {
    mockRevalidatePath.mockImplementationOnce(() => { throw new Error('boom'); });
    const res = await POST(req({ _type: 'post' }, 'correct-secret'));
    const body = await res.json();
    expect(body.revalidated).toBe(false);
    expect(body.failures).toEqual(['/en/blog']);
  });
});
