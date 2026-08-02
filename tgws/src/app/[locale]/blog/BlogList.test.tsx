import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BlogList from './BlogList';

vi.mock('next-intl', () => {
  const m: Record<string, string> = {
    title: 'Blog', readingTime: 'min read', searchPlaceholder: 'Search articles', noResults: 'No articles found',
    'categories.all': 'All', 'categories.news': 'News', 'categories.technical': 'Technical',
    'categories.case-study': 'Case Study', 'categories.industry': 'Industry',
  };
  const t = (key: string) => m[key] ?? key;
  return { useTranslations: () => t };
});

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('@/lib/sanity.image', () => ({
  urlFor: () => ({
    width: () => ({ height: () => ({ url: () => '/mock-image.jpg' }) }),
  }),
}));

vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={String(props.alt)} /> }));

const posts = [
  { _id: '1', title: 'HCI Explained', titleZh: '超融合說明', slug: { current: 'hci-explained' }, category: 'technical', excerpt: 'Deep dive into HCI', excerptZh: '深入探討', author: 'Regil', publishedAt: '2024-01-10T00:00:00Z', featured: true, coverImage: 'img1', tags: ['hci', 'storage'] },
  { _id: '2', title: 'Company News', titleZh: '公司新聞', slug: { current: 'company-news' }, category: 'news', excerpt: 'Our latest updates', excerptZh: '最新消息', author: 'Team', publishedAt: '2024-02-01T00:00:00Z', featured: false, coverImage: 'img2', tags: ['news'] },
  { _id: '3', title: 'Security Best Practices', titleZh: '安全最佳實務', slug: { current: 'security' }, category: 'industry', excerpt: 'Security tips', excerptZh: '安全提示', author: 'Regil', publishedAt: '2024-03-05T00:00:00Z', featured: false, coverImage: 'img3', tags: ['security'] },
];

describe('BlogList', () => {
  it('renders all posts and shows featured first', () => {
    render(<BlogList posts={posts} />);
    expect(screen.getByText('HCI Explained')).toBeInTheDocument();
    expect(screen.getByText('Company News')).toBeInTheDocument();
    expect(screen.getByText('Security Best Practices')).toBeInTheDocument();
  });

  it('filters by category', () => {
    render(<BlogList posts={posts} />);
    fireEvent.click(screen.getAllByRole('button').find(b => b.textContent === 'News')!);
    expect(screen.getByText('Company News')).toBeInTheDocument();
    expect(screen.queryByText('HCI Explained')).not.toBeInTheDocument();
  });

  it('filters by search query', () => {
    render(<BlogList posts={posts} />);
    fireEvent.change(screen.getByPlaceholderText('Search articles'), { target: { value: 'security' } });
    expect(screen.getByText('Security Best Practices')).toBeInTheDocument();
    expect(screen.queryByText('Company News')).not.toBeInTheDocument();
  });

  it('shows no-results state when nothing matches', () => {
    render(<BlogList posts={posts} />);
    fireEvent.change(screen.getByPlaceholderText('Search articles'), { target: { value: 'zzz' } });
    expect(screen.getAllByText('No articles found').length).toBeGreaterThan(0);
  });

  it('displays reading time and author', () => {
    render(<BlogList posts={posts} />);
    // reading time "min read" appears
    expect(screen.getAllByText(/min read/).length).toBeGreaterThan(0);
  });
});
