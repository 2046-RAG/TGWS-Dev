import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TermsPage from './page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) =>
    namespace === 'common.breadcrumb' && key === 'home' ? 'Home' : `${namespace}.${key}`,
}));

const termsTranslations: Record<string, unknown> = {
  title: 'Terms of Service',
  lastUpdated: 'Last Updated',
  lastUpdatedDate: 'June 30, 2026',
  section1Title: 'Acceptance of Terms',
  section1Body: 'By accessing this website, you agree to these terms.',
  section2Title: 'Use of Services',
  section2Body: 'You may use our services only for lawful purposes.',
  section3Title: 'Intellectual Property',
  section3Body: 'All content on this site is owned by TechGuru.',
  section4Title: 'Limitation of Liability',
  section4Body: 'TechGuru is not liable for indirect damages.',
  section5Title: 'Indemnification',
  section5Body: 'You agree to indemnify TechGuru.',
  section6Title: 'Termination',
  section6Body: 'We may terminate access at any time.',
  section7Title: 'Contact',
  section7Body: 'For terms inquiries, contact us at',
  backHome: 'Back to Home',
};

const legalTranslations: Record<string, unknown> = {
  toc: 'On this page',
  print: 'Print this page',
};

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => {
    const store =
      namespace === 'terms'
        ? termsTranslations
        : namespace === 'legal'
          ? legalTranslations
          : {};
    const t = (key: string) => (key in store ? String(store[key]) : `${namespace}.${key}`);
    (t as unknown as { raw: (key: string) => unknown }).raw = (key: string) =>
      key in store ? store[key] : [`${namespace}.${key}`];
    return t;
  },
  getLocale: async () => 'en',
}));

describe('TermsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title as an h1', async () => {
    const ui = await TermsPage();
    render(ui);
    expect(
      screen.getByRole('heading', { name: 'Terms of Service', level: 1 })
    ).toBeInTheDocument();
  });

  it('renders the "Last Updated" label and date', async () => {
    const ui = await TermsPage();
    render(ui);
    expect(screen.getByText('Last Updated:')).toBeInTheDocument();
    // Date now comes from process.env.NEXT_PUBLIC_BUILD_DATE with fallback
    // to '2026-07-19' when the env var is unset (e.g. test env).
    expect(screen.getByText('2026-07-19')).toBeInTheDocument();
  });

  it('renders all 7 numbered section headings', async () => {
    const ui = await TermsPage();
    render(ui);
    const expected = [
      '1. Acceptance of Terms',
      '2. Use of Services',
      '3. Intellectual Property',
      '4. Limitation of Liability',
      '5. Indemnification',
      '6. Termination',
      '7. Contact',
    ];
    expected.forEach((h) => {
      expect(screen.getByRole('heading', { name: h, level: 2 })).toBeInTheDocument();
    });
  });

  it('renders each section body paragraph', async () => {
    const ui = await TermsPage();
    render(ui);
    expect(
      screen.getByText('By accessing this website, you agree to these terms.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('You may use our services only for lawful purposes.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('All content on this site is owned by TechGuru.')
    ).toBeInTheDocument();
  });

  it('renders a "Back to Home" link pointing to /en/home', async () => {
    const ui = await TermsPage();
    render(ui);
    const link = screen.getByRole('link', { name: 'Back to Home' });
    expect(link).toHaveAttribute('href', '/en/home');
  });

  it('renders the support email as a mailto link in section 7', async () => {
    const ui = await TermsPage();
    render(ui);
    const mailtoLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('mailto:'));
    expect(mailtoLinks).toHaveLength(1);
    expect(mailtoLinks[0]).toHaveAttribute('href', 'mailto:Inquiries@techguru-it.asia');
    expect(mailtoLinks[0]).toHaveTextContent('Inquiries@techguru-it.asia');
  });

  it('exposes a breadcrumb navigation landmark', async () => {
    const ui = await TermsPage();
    render(ui);
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
  });
});
