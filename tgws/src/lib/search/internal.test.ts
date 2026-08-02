import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchInternal } from './internal';

// Mock the Sanity client used by internal.ts
const fetchMock = vi.fn();
vi.mock('@/lib/sanity', () => ({
  client: { fetch: (...args: unknown[]) => fetchMock(...args) },
}));

// Minimal logServiceError no-op
vi.mock('@/lib/errors', () => ({
  logServiceError: vi.fn(),
}));

function product(over: Record<string, unknown> = {}) {
  const base = {
    _id: 'p1', title: 'HCI Appliance', titleZh: '超融合設備', slug: { current: 'hci-appliance' },
    category: 'Run', description: 'Hyper-converged infrastructure appliance', descriptionZh: '超融合基礎架構設備',
  };
  // GROQ aliases `"pillar": category` — mirror that in the mock data
  return { ...base, ...over, pillar: (over.category as string) || base.category };
}

describe('searchInternal', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('matches products by English terms and applies pillar filter', async () => {
    fetchMock
      .mockResolvedValueOnce([
        product(),
        product({ _id: 'p2', title: 'Firewall', category: 'Protect', description: 'Next-gen firewall' }),
      ]) // products
      .mockResolvedValueOnce([]) // solutions
      .mockResolvedValueOnce([]) // posts
      .mockResolvedValueOnce([]); // faqs
    const results = await searchInternal('hyper-converged', { pillar: ['Run'] });
    expect(fetchMock).toHaveBeenCalledTimes(4); // products + solutions + posts + faqs
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('HCI Appliance');
    expect(results[0].url).toBe('/en/products/hci-appliance');
  });

  it('returns zh titles when locale=zh', async () => {
    fetchMock
      .mockResolvedValueOnce([product()]) // products
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const results = await searchInternal('超融合', undefined, 'zh');
    expect(results[0].title).toBe('超融合設備');
    expect(results[0].url).toBe('/zh/products/hci-appliance');
  });

  it('matches blog posts by tags', async () => {
    fetchMock
      .mockResolvedValueOnce([]) // products
      .mockResolvedValueOnce([]) // solutions
      .mockResolvedValueOnce([{ _id: 'b1', title: 'Cloud Migration Guide', excerpt: 'How to move to cloud', tags: ['cloud', 'migration'] }]) // posts
      .mockResolvedValueOnce([]); // faqs
    const results = await searchInternal('cloud');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('blog');
  });

  it('sorts results by relevance score descending', async () => {
    fetchMock
      .mockResolvedValueOnce([
        product({ _id: 'low', title: 'Something Else', description: 'mentions hyper-converged once' }),
        product({ _id: 'high', title: 'Hyper-converged Exactly', description: 'hyper-converged explained in detail' }),
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const results = await searchInternal('hyper-converged');
    expect(results.length).toBeGreaterThan(1);
    expect(results[0].id).toBe('high');
    expect(results[0].relevanceScore).toBeGreaterThanOrEqual(results[1].relevanceScore);
  });

  it('returns empty array when Sanity fetch throws', async () => {
    fetchMock.mockRejectedValue(new Error('sanity down'));
    const results = await searchInternal('anything');
    expect(results).toEqual([]);
  });

  it('applies industry filter to solutions', async () => {
    fetchMock
      .mockResolvedValueOnce([]) // products
      .mockResolvedValueOnce([
        { _id: 's1', title: 'Healthcare Cloud', industry: 'healthcare', description: 'cloud for healthcare' },
        { _id: 's2', title: 'Retail Cloud', industry: 'retail', description: 'cloud for retail' },
      ]) // solutions
      .mockResolvedValueOnce([]) // posts
      .mockResolvedValueOnce([]); // faqs
    const results = await searchInternal('cloud', { industry: ['healthcare'] });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Healthcare Cloud');
  });
});
