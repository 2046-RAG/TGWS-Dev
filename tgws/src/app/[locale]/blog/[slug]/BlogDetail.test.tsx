import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import BlogDetail from './BlogDetail';

vi.mock('next-intl', () => {
  const m: Record<string, string> = { copied: 'Copied', copy: 'Copy' };
  const t = (key: string) => m[key] ?? key;
  return { useTranslations: () => t };
});

vi.mock('@/lib/sanity.image', () => ({
  urlFor: () => ({ width: () => ({ height: () => ({ url: () => '/mock-cover.jpg' }) }) }),
}));

vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={String(props.alt)} /> }));

vi.mock('@/components/ui/JsonLd', () => ({
  ArticleJsonLd: () => <div data-testid="article-jsonld" />,
}));

const post = {
  _id: '1',
  title: 'Understanding HCI',
  titleZh: '了解超融合',
  slug: { current: 'understanding-hci' },
  category: 'technical',
  excerpt: 'Excerpt',
  excerptZh: '摘要',
  author: 'Regil',
  publishedAt: '2024-01-15T00:00:00Z',
  featured: true,
  coverImage: 'img1',
  tags: ['hci'],
  content: [
    { _type: 'block', style: 'h2', children: [{ text: 'Introduction' }] },
    { _type: 'block', style: 'h3', children: [{ text: 'Deep Dive' }] },
    { _type: 'block', children: [{ text: '[INFO] Key takeaway here' }] },
    { _type: 'block', children: [{ text: '[WARNING] Be careful' }] },
    { _type: 'block', children: [{ text: '[TIP] Pro tip here' }] },
    { _type: 'block', style: 'blockquote', children: [{ text: 'Quoted text' }] },
    { _type: 'block', children: [{ text: 'Normal paragraph text.' }] },
    { _type: 'code', code: 'const x = 1;', language: 'js' },
    { _type: 'block', children: [{ text: '' }] },
  ],
  contentZh: [
    { _type: 'block', style: 'h2', children: [{ text: '介紹' }] },
    { _type: 'block', children: [{ text: '普通段落。' }] },
  ],
};

describe('BlogDetail', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', { value: { href: 'https://www.techguru-it.asia/en/blog/x' }, writable: true });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders headings, callouts, blockquote, paragraphs and code', () => {
    render(<BlogDetail post={post as never} locale="en" />);
    expect(screen.getByText('Understanding HCI')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Deep Dive')).toBeInTheDocument();
    expect(screen.getByText('Key takeaway here')).toBeInTheDocument();
    expect(screen.getByText('Be careful')).toBeInTheDocument();
    expect(screen.getByText('Pro tip here')).toBeInTheDocument();
    expect(screen.getByText('Quoted text')).toBeInTheDocument();
    expect(screen.getByText('Normal paragraph text.')).toBeInTheDocument();
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('copies code via clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<BlogDetail post={post as never} locale="en" />);
    fireEvent.click(screen.getByText('Copy'));
    await act(async () => { await Promise.resolve(); });
    expect(writeText).toHaveBeenCalledWith('const x = 1;');
  });

  it('shows share menu when navigator.share is unavailable', () => {
    Object.assign(navigator, { share: undefined });
    render(<BlogDetail post={post as never} locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  it('uses navigator.share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });
    render(<BlogDetail post={post as never} locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    await act(async () => { await Promise.resolve(); });
    expect(share).toHaveBeenCalled();
  });

  it('renders zh content in Chinese mode', () => {
    render(<BlogDetail post={post as never} locale="zh" />);
    expect(screen.getByText('了解超融合')).toBeInTheDocument();
    expect(screen.getByText('介紹')).toBeInTheDocument();
  });
});
