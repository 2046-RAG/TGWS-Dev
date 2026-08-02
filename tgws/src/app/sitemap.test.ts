import { describe, it, expect, vi } from 'vitest';
import sitemap from './sitemap';

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));

vi.mock('@/lib/sanity.server', () => ({
  client: { fetch: mockFetch },
}));

vi.mock('@/i18n/config', () => ({
  locales: ['en', 'zh'],
}));

describe('sitemap', () => {
  it('includes all static pages for both locales', async () => {
    mockFetch.mockResolvedValue([]);
    const entries = await sitemap();
    // 19 static pages × 2 locales = 38
    expect(entries.length).toBe(38);
    expect(entries[0].url).toBe('https://www.techguru-it.asia/en');
    expect(entries[0].priority).toBe(1);
    expect(entries.some(e => e.url === 'https://www.techguru-it.asia/zh/products')).toBe(true);
  });

  it('includes blog and product slugs', async () => {
    mockFetch
      .mockResolvedValueOnce([{ slug: { current: 'hci-guide' }, _updatedAt: '2024-01-01' }])
      .mockResolvedValueOnce([{ slug: { current: 'vsphere' }, _updatedAt: '2024-02-02' }]);
    const entries = await sitemap();
    expect(entries.some(e => e.url === 'https://www.techguru-it.asia/en/blog/hci-guide')).toBe(true);
    expect(entries.some(e => e.url === 'https://www.techguru-it.asia/zh/products/vsphere')).toBe(true);
  });

  it('falls back to empty slugs when Sanity fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('sanity down'));
    const entries = await sitemap();
    expect(entries.length).toBe(38); // static only
  });

  it('deduplicates duplicate slugs', async () => {
    mockFetch.mockResolvedValue([
      { slug: { current: 'same' }, _updatedAt: '2024-01-01' },
      { slug: { current: 'same' }, _updatedAt: '2024-02-02' },
    ]);
    const entries = await sitemap();
    const matches = entries.filter(e => e.url === 'https://www.techguru-it.asia/en/blog/same');
    expect(matches).toHaveLength(1);
  });
});
