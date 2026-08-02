import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductsList from './ProductsList';

vi.mock('next-intl', () => {
  const m: Record<string, string> = {
    title: 'Products', subtitle: 'Our solutions', build: 'Build', run: 'Run', protect: 'Protect',
    buildTitle: 'Build', runTitle: 'Run', protectTitle: 'Protect',
    buildStory: 'AI & cloud', runStory: 'Infrastructure', protectStory: 'Security',
    searchPlaceholder: 'Search products', noResults: 'No products found',
    'features.hci-appliance.0': 'HCI Appliance',
  };
  const t = (key: string) => m[key] ?? key;
  (t as unknown as Record<string, unknown>).raw = (key: string) => {
    if (key === 'features.hci-appliance') return ['HCI feature'];
    return undefined;
  };
  return { useTranslations: () => t };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => ({ get: () => null, toString: () => '' }),
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...rest }: { children?: React.ReactNode }) => <div data-motion="1" {...rest}>{children}</div> },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./shared', () => ({
  slugToI18n: { 'hci-appliance': 'features.hci-appliance.0' },
  iconMap: {},
  tabColors: { build: '#00D4FF', run: '#7B61FF', protect: '#22C55E' },
  runSubgroups: [
    { key: 'virtualization', i18nKey: 'Virtualization', slugs: ['hci-appliance'] },
    { key: 'networking', i18nKey: 'Networking', slugs: ['core-switches'] },
  ],
}));

vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={String(props.alt)} /> }));

const products = [
  { _id: '1', title: 'HCI Appliance', slug: { current: 'hci-appliance' }, category: 'run', order: 1, description: 'HCI', descriptionZh: '超融合', features: ['f1'] },
  { _id: '2', title: 'Core Switches', slug: { current: 'core-switches' }, category: 'run', order: 2, description: 'Switches', descriptionZh: '交換機', features: [] },
  { _id: '3', title: 'AI Platform', slug: { current: 'ai-platform' }, category: 'build', order: 3, description: 'AI', descriptionZh: 'AI', features: [] },
];

describe('ProductsList', () => {
  it('renders tabs and build products by default', () => {
    render(<ProductsList products={products} />);
    const tabButtons = screen.getAllByRole('button');
    const labels = tabButtons.map(b => b.textContent);
    expect(labels.some(l => l?.includes('Build'))).toBe(true);
    expect(labels.some(l => l?.includes('Run'))).toBe(true);
    expect(labels.some(l => l?.includes('Protect'))).toBe(true);
    expect(screen.getByText('AI Platform')).toBeInTheDocument();
    expect(screen.queryByText('HCI Appliance')).not.toBeInTheDocument();
  });

  it('switches to Run tab and groups products by subcategory', () => {
    render(<ProductsList products={products} />);
    fireEvent.click(screen.getAllByRole('button').find(b => b.textContent?.includes('Run'))!);
    expect(screen.getByText('HCI Appliance')).toBeInTheDocument();
    expect(screen.getByText('Virtualization')).toBeInTheDocument();
    expect(screen.getByText('Networking')).toBeInTheDocument();
    expect(screen.queryByText('AI Platform')).not.toBeInTheDocument();
  });

  it('filters products by search query', () => {
    render(<ProductsList products={products} />);
    fireEvent.click(screen.getByText('Run'));
    fireEvent.change(screen.getByPlaceholderText('Search products'), { target: { value: 'hci' } });
    expect(screen.getByText('HCI Appliance')).toBeInTheDocument();
    expect(screen.queryByText('Core Switches')).not.toBeInTheDocument();
  });

  it('shows no-results and clear button when search matches nothing', () => {
    render(<ProductsList products={products} />);
    fireEvent.change(screen.getByPlaceholderText('Search products'), { target: { value: 'zzz' } });
    expect(screen.getByText('No products found')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear search'));
    expect(screen.getByText('AI Platform')).toBeInTheDocument();
  });

  it('clears search via the X button', () => {
    render(<ProductsList products={products} />);
    fireEvent.change(screen.getByPlaceholderText('Search products'), { target: { value: 'ai' } });
    expect(screen.queryByText('AI Platform')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(screen.getByText('AI Platform')).toBeInTheDocument();
  });
});
