import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryPage from './CategoryPage';

vi.mock('next-intl', () => {
  const m: Record<string, string> = { 'features.hci.0': 'HCI Feature' };
  const t = (key: string) => m[key] ?? key;
  (t as unknown as Record<string, unknown>).raw = (key: string) => {
    if (key === 'features.hci') return ['HCI features list'];
    return undefined;
  };
  return { useTranslations: () => t };
});

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...rest }: { children?: React.ReactNode }) => <div {...rest}>{children}</div> },
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock('./shared', () => ({
  slugToI18n: { 'hci': 'features.hci.0' },
  iconMap: {},
  tabColors: { build: '#00D4FF', run: '#7B61FF', protect: '#22C55E' },
  runSubgroups: [
    { key: 'virtualization', i18nKey: 'Virtualization', slugs: ['hci'] },
    { key: 'networking', i18nKey: 'Networking', slugs: ['switches'] },
  ],
}));

const products = [
  { _id: '1', title: 'HCI', slug: { current: 'hci' }, category: 'run', subcategory: 'virtualization', order: 1, description: 'D', descriptionZh: 'Zh', features: [] },
  { _id: '2', title: 'Switches', slug: { current: 'switches' }, category: 'run', subcategory: 'networking', order: 2, description: 'D', descriptionZh: 'Zh', features: [] },
  { _id: '3', title: 'AI', slug: { current: 'ai' }, category: 'build', order: 3, description: 'D', descriptionZh: 'Zh', features: [] },
];

describe('CategoryPage', () => {
  it('filters products by category', () => {
    render(<CategoryPage category="build" products={products as never} />);
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.queryByText('HCI Feature')).not.toBeInTheDocument();
  });

  it('groups run products by subcategory', () => {
    render(<CategoryPage category="run" products={products as never} />);
    expect(screen.getByText('Virtualization')).toBeInTheDocument();
    expect(screen.getByText('Networking')).toBeInTheDocument();
    expect(screen.getByText('HCI Feature')).toBeInTheDocument(); // i18n-resolved title
    expect(screen.getByText('Switches')).toBeInTheDocument();
  });

  it('links product cards to detail pages', () => {
    render(<CategoryPage category="run" products={products as never} />);
    const hciLink = screen.getByText('HCI Feature').closest('a')!;
    expect(hciLink.getAttribute('href')).toBe('/en/products/hci');
  });

  it('renders flat list for non-run categories', () => {
    render(<CategoryPage category="build" products={products as never} />);
    expect(screen.queryByText('Virtualization')).not.toBeInTheDocument();
  });
});
