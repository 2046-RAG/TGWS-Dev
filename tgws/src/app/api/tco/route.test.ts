import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

const { mockFetch, mockLogError } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/sanity.server', () => ({
  client: { fetch: mockFetch },
}));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

const config = { serviceFeeRate: 0.15, lastUpdated: '2026-07', scenarios: [{ name: 'S', slug: 's', order: 1, bundles: [] }] };

describe('api/tco GET', () => {
  it('returns config on success', async () => {
    mockFetch.mockResolvedValue(config);
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.scenarios).toHaveLength(1);
  });

  it('returns 404 when config missing', async () => {
    mockFetch.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(404);
  });

  it('returns 500 when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('sanity down'));
    const res = await GET();
    expect(res.status).toBe(500);
    expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({ service: 'Sanity' }));
  });
});
