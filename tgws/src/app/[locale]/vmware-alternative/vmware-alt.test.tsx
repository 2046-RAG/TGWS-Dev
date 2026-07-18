import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import VMwareAlternativePage from './page';

// Mock next/navigation — VMwareAlternativePage reads `locale` from useParams()
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

// The page uses two translators: `vmware` and `contact`. Return the
// namespace-qualified key so each test can assert exact strings.
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

describe('VMwareAlternativePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hero tag, title, and subtitle', () => {
    render(<VMwareAlternativePage />);
    // heroTag appears twice: once as the breadcrumb's last item label and
    // once as the hero span. Assert both occurrences via getAllByText.
    expect(screen.getAllByText('vmware.heroTag')).toHaveLength(2);
    expect(
      screen.getByRole('heading', { name: 'vmware.heroTitle' })
    ).toBeInTheDocument();
    expect(screen.getByText('vmware.heroSubtitle')).toBeInTheDocument();
  });

  it('renders the primary hero CTA linking to /en/contact', () => {
    render(<VMwareAlternativePage />);
    const cta = screen.getByRole('link', { name: /vmware\.heroCta/ });
    expect(cta).toHaveAttribute('href', '/en/contact');
  });

  it('renders the hero phone CTA as a `tel:` href (dial, not navigate)', () => {
    render(<VMwareAlternativePage />);
    // ctaPhone label is rendered as an anchor in the hero whose href is a
    // `tel:` link built from contact.phoneNumber (not a navigation link).
    const phoneCta = screen.getByRole('link', { name: /vmware\.ctaPhone/ });
    expect(phoneCta).toBeInTheDocument();
    expect(phoneCta).toHaveAttribute('href', 'tel:contact.phoneNumber');
  });

  it('keeps the two hero CTAs behaviorally distinct (contact link vs tel: link)', () => {
    render(<VMwareAlternativePage />);
    const heroCta = screen.getByRole('link', { name: /vmware\.heroCta/ });
    expect(heroCta).toHaveAttribute('href', '/en/contact');

    const phoneCta = screen.getByRole('link', { name: /vmware\.ctaPhone/ });
    expect(phoneCta.getAttribute('href')).toMatch(/^tel:/);
  });

  it('renders the "Why Migrate" section heading and 4 reason cards', () => {
    render(<VMwareAlternativePage />);
    expect(
      screen.getByRole('heading', { name: 'vmware.whyTitle' })
    ).toBeInTheDocument();
    expect(screen.getByText('vmware.whySubtitle')).toBeInTheDocument();
    // 4 reason cards each render a title (reason1Title…reason4Title)
    ['reason1', 'reason2', 'reason3', 'reason4'].forEach((r) => {
      expect(screen.getByText(`vmware.${r}Title`)).toBeInTheDocument();
      expect(screen.getByText(`vmware.${r}Desc`)).toBeInTheDocument();
    });
  });

  it('renders the 4 solution cards (Proxmox, Sangfor, Nutanix, StarWind)', () => {
    render(<VMwareAlternativePage />);
    expect(
      screen.getByRole('heading', { name: 'vmware.solutionsTitle' })
    ).toBeInTheDocument();
    ['sol1', 'sol2', 'sol3', 'sol4'].forEach((s) => {
      expect(screen.getByText(`vmware.${s}Title`)).toBeInTheDocument();
      expect(screen.getByText(`vmware.${s}Desc`)).toBeInTheDocument();
    });
  });

  it('renders the "view all products" link pointing to /en/products', () => {
    render(<VMwareAlternativePage />);
    const link = screen.getByRole('link', { name: /vmware\.viewAllProducts/ });
    expect(link).toHaveAttribute('href', '/en/products');
  });

  it('renders 4 migration process steps', () => {
    render(<VMwareAlternativePage />);
    expect(
      screen.getByRole('heading', { name: 'vmware.processTitle' })
    ).toBeInTheDocument();
    ['step1', 'step2', 'step3', 'step4'].forEach((s) => {
      expect(screen.getByText(`vmware.${s}`)).toBeInTheDocument();
    });
  });

  it('renders the stats section with 4 stat values', () => {
    render(<VMwareAlternativePage />);
    expect(
      screen.getByRole('heading', { name: 'vmware.statsTitle' })
    ).toBeInTheDocument();
    // stat1Label…stat4Label render as visible text
    ['stat1Label', 'stat2Label', 'stat3Label', 'stat4Label'].forEach((l) => {
      expect(screen.getByText(`vmware.${l}`)).toBeInTheDocument();
    });
  });

  it('renders the final CTA section with a `tel:` href using contact.phoneNumber', () => {
    render(<VMwareAlternativePage />);
    // The bottom CTA renders a `tel:` anchor built from contact.phoneNumber.
    const telLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('tel:'));
    expect(telLinks.length).toBeGreaterThan(0);
    // href should be tel:contact.phoneNumber (no spaces)
    expect(telLinks[0]).toHaveAttribute('href', 'tel:contact.phoneNumber');
  });

  it('exposes a breadcrumb navigation landmark', () => {
    render(<VMwareAlternativePage />);
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
  });
});
