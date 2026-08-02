import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMetadata, default as BlogDetailPage } from './page';

const { mockFetch, mockLogError } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/sanity.server', () => ({
  client: { fetch: mockFetch },
}));

vi.mock('@/lib/sanity.image', () => ({
  urlFor: () => ({ width: () => ({ height: () => ({ url: () => '/og-image.jpg' }) }) }),
}));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

vi.mock('./BlogDetail', () => ({
  default: () => <div data-testid="blog-detail" />,
}));

vi.mock('next/navigation', () => ({ notFound: vi.fn() }));

const post = {
  _id: '1',
  title: 'Understanding HCI',
  titleZh: '了解超融合',
  excerpt: 'An excerpt',
  excerptZh: '摘要',
  coverImage: { asset: { _ref: 'x' } },
  slug: { current: 'understanding-hci' },
  category: 'technical',
  content: [],
  contentZh: [],
};

describe('blog/[slug] generateMetadata', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockLogError.mockReset();
  });

  it('returns post title and description for en', async () => {
    mockFetch.mockResolvedValue(post);
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'x', locale: 'en' }) });
    expect(meta.title).toBe('Understanding HCI');
    expect(meta.description).toBe('An excerpt');
    expect(meta.openGraph?.images?.[0]?.url).toBe('/og-image.jpg');
  });

  it('returns zh title and description for zh locale', async () => {
    mockFetch.mockResolvedValue(post);
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'x', locale: 'zh' }) });
    expect(meta.title).toBe('了解超融合');
    expect(meta.description).toBe('摘要');
  });

  it('falls back to brand logo when no cover image', async () => {
    mockFetch.mockResolvedValue({ ...post, coverImage: null });
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'x', locale: 'en' }) });
    expect(meta.openGraph?.images?.[0]?.url).toBe('https://www.techguru-it.asia/logos/techguru-logo.png');
  });

  it('handles locale-object titles', async () => {
    mockFetch.mockResolvedValue({ ...post, title: { en: 'EN Title', zh: '中文標題' } });
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'x', locale: 'en' }) });
    expect(meta.title).toBe('EN Title');
  });

  it('returns not-found title when post missing', async () => {
    mockFetch.mockResolvedValue(null);
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'x', locale: 'en' }) });
    expect(meta.title).toBe('Post Not Found');
  });

  it('returns null from getPost on fetch error and logs', async () => {
    mockFetch.mockRejectedValue(new Error('sanity down'));
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'x', locale: 'en' }) });
    expect(meta.title).toBe('Post Not Found');
    expect(mockLogError).toHaveBeenCalled();
  });
});

describe('blog/[slug] page render', () => {
  it('renders BlogDetail for an existing post', async () => {
    mockFetch.mockResolvedValue(post);
    const { render, screen } = await import('@testing-library/react');
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'x', locale: 'en' }) });
    const { container } = render(el);
    expect(container.querySelector('[data-testid="blog-detail"]')).toBeTruthy();
    void screen;
  });
});
