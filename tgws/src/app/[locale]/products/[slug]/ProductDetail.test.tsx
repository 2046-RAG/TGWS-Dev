import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductDetail from './ProductDetail';

// locale controllable per test via a mutable variable
let mockLocale = 'en';

vi.mock('next-intl', () => {
  const m: Record<string, string> = { 'features.hci.0': 'Feature A', 'features.hci.1': 'Feature B' };
  const t = (key: string) => m[key] ?? key;
  (t as unknown as Record<string, unknown>).raw = (key: string) => {
    if (key === 'features.hci') return ['Feature A', 'Feature B'];
    return undefined;
  };
  return { useTranslations: () => t };
});

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: mockLocale }),
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...rest }: { children?: React.ReactNode }) => <div {...rest}>{children}</div> },
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock('../shared', () => ({
  slugToI18n: {}, // empty so product.title is used for the heading
  iconMap: {},
  tabColors: { build: '#00D4FF', run: '#7B61FF', protect: '#22C55E' },
}));

const product = {
  _id: '1',
  title: 'HCI Appliance',
  slug: { current: 'hci' },
  category: 'run',
  subcategory: 'virtualization',
  order: 1,
  description: 'Hyper-converged infrastructure',
  descriptionZh: '超融合基礎架構',
  features: ['feature1', 'feature2'],
  relatedVendors: [
    { vendor: 'Nutanix', solution: 'Nutanix HCI', description: 'Partner solution' },
    { vendor: 'Sangfor', solution: 'Sangfor HCI', description: 'Alt solution' },
  ],
};

describe('ProductDetail', () => {
  it('renders product title and i18n-resolved features', () => {
    render(<ProductDetail product={product as never} />);
    expect(screen.getByText('HCI Appliance')).toBeInTheDocument();
    expect(screen.getByText('Feature A')).toBeInTheDocument();
    expect(screen.getByText('Feature B')).toBeInTheDocument();
  });

  it('renders zh description in zh mode', () => {
    mockLocale = 'zh';
    render(<ProductDetail product={product as never} />);
    expect(screen.getByText('超融合基礎架構')).toBeInTheDocument();
    mockLocale = 'en'; // reset for later tests
  });

  it('renders related vendor solutions', () => {
    render(<ProductDetail product={product as never} />);
    expect(screen.getByText('Nutanix')).toBeInTheDocument();
    expect(screen.getByText('Sangfor')).toBeInTheDocument();
    expect(screen.getByText('Nutanix HCI')).toBeInTheDocument();
  });

  it('renders a contact CTA link', () => {
    render(<ProductDetail product={product as never} />);
    const contact = screen.getByText('Contact Us').closest('a')!;
    expect(contact.getAttribute('href')).toBe('/en/contact');
  });
});
