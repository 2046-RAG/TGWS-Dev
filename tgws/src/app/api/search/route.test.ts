import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const { mockFrom, mockLogError } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: mockFrom,
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));
vi.mock('@/lib/search/internal', () => ({ searchInternal: async () => [] }));
vi.mock('@/lib/search/external', () => ({
  searchGoogleCSE: async () => [],
  searchTavily: async () => ({ results: [], answer: '' }),
  deduplicateResults: () => ({ internal: [], external: [] }),
  filterExternalResults: (r: unknown[]) => r,
  isExternalSourcesConfigured: () => false,
}));
vi.mock('@/lib/search/ai', () => ({ generateAiSummary: async () => 'summary' }));
vi.mock('@/lib/search/capability', () => ({
  detectCapabilityGap: async () => ({ detected: false, gapDescription: '' }),
}));

let seq = 0;
function req(body: unknown): NextRequest {
  seq += 1;
  return new NextRequest('http://x/api/search', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'x-forwarded-for': `10.20.0.${(seq % 254) + 1}` },
  });
}

let insert: ReturnType<typeof vi.fn>;

describe('api/search POST — search log destination (T-068)', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockLogError.mockReset();
    insert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert });
  });

  it('writes a text search to Supabase search_logs with the 005 schema fields', async () => {
    const res = await POST(req({ query: 'hci', type: 'text', filters: { category: 'run' } }));
    expect(res.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('search_logs');
    expect(insert).toHaveBeenCalledTimes(1);

    const payload = insert.mock.calls[0][0];
    expect(payload.query).toBe('hci');
    expect(payload.query_type).toBe('text');
    expect(payload.filters).toEqual({ category: 'run' });
    expect(payload.results_count).toBe(0);
    expect(payload.internal_count).toBe(0);
    expect(payload.external_count).toBe(0);
    expect(payload.capability_gap_detected).toBe(false);
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('maps an image search to query_type=image', async () => {
    const res = await POST(req({ type: 'image', imageData: 'data:image/png;base64,AAA' }));
    expect(res.status).toBe(200);
    const payload = insert.mock.calls[0][0];
    expect(payload.query_type).toBe('image');
    expect(payload.query).toBe('image search');
  });

  it('still returns 200 when logging fails (logging is non-fatal)', async () => {
    insert.mockResolvedValue({ error: { message: 'rls denied' } });
    const res = await POST(req({ query: 'hci' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockLogError).toHaveBeenCalled();
  });

  it('rejects an empty search before doing any work', async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });
});
