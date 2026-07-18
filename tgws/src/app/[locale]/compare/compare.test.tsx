import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComparePage from './page';

// Mock next/navigation — ComparePage reads `locale` from useParams()
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

// Build a translator that returns deterministic strings for the keys
// actually consumed by ComparePage. Unknown keys fall back to the key
// itself so missing keys surface during the test instead of failing
// silently.
function makeT(prefix: string) {
  return (key: string) => `${prefix}.${key}`;
}

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => makeT(namespace),
}));

describe('ComparePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hero title and subtitle from compare namespace', () => {
    render(<ComparePage />);
    expect(screen.getByText('compare.heroTag')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'compare.title' })).toBeInTheDocument();
    expect(screen.getByText('compare.subtitle')).toBeInTheDocument();
  });

  it('renders the comparison table with 4 column headers', () => {
    render(<ComparePage />);
    expect(screen.getByRole('columnheader', { name: 'compare.table.feature' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'compare.table.techguru' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'compare.table.competitorA' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'compare.table.competitorB' })).toBeInTheDocument();
  });

  it('exposes an accessible name for the comparison table via aria-label', () => {
    render(<ComparePage />);
    expect(
      screen.getByRole('table', { name: 'compare.table.ariaLabel' })
    ).toBeInTheDocument();
  });

  it('renders a caption describing the table contents', () => {
    render(<ComparePage />);
    const table = screen.getByRole('table');
    const caption = table.querySelector('caption');
    expect(caption).not.toBeNull();
    expect(caption).toHaveTextContent('compare.table.caption');
  });

  it('marks the TechGuru column header with scope and aria-label for a11y', () => {
    render(<ComparePage />);
    const techguruHeader = screen.getByRole('columnheader', {
      name: 'compare.table.techguru',
    });
    expect(techguruHeader).toHaveAttribute('scope', 'col');
    expect(techguruHeader).toHaveAttribute('aria-label', 'compare.table.techguru');
  });

  it('renders one table row per feature key (7 features)', () => {
    render(<ComparePage />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 7 feature rows
    expect(rows).toHaveLength(8);
  });

  it('renders the partner certifications section heading', () => {
    render(<ComparePage />);
    expect(
      screen.getByRole('heading', { name: 'compare.partnerCertifications' })
    ).toBeInTheDocument();
  });

  it('renders 6 partner certification cards (one per vendor)', () => {
    render(<ComparePage />);
    // Each vendor card displays the vendor name in a <p> tag.
    const vendors = ['Sangfor', 'Fortinet', 'Nutanix', 'Ruijie', 'Huawei', 'Sundray'];
    vendors.forEach((v) => {
      expect(screen.getByText(v)).toBeInTheDocument();
    });
  });

  it('renders the CTA section with link to /en/contact', () => {
    render(<ComparePage />);
    const cta = screen.getByRole('link', { name: /compare\.ctaBtn/ });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/en/contact');
  });

  it('renders the CTA title and description from i18n', () => {
    render(<ComparePage />);
    expect(
      screen.getByRole('heading', { name: 'compare.ctaTitle' })
    ).toBeInTheDocument();
    expect(screen.getByText('compare.ctaDesc')).toBeInTheDocument();
  });

  it('exposes a breadcrumb navigation landmark (via Breadcrumb)', () => {
    render(<ComparePage />);
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
  });
});
