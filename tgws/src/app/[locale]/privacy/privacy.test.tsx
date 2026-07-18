import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import PrivacyPage from './page';

// PrivacyPage is an async server component that reads `useParams` via
// the Breadcrumb client component, so we need next/navigation mocked.
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

// Mock next-intl (used by Breadcrumb's useTranslations)
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) =>
    namespace === 'common.breadcrumb' && key === 'home' ? 'Home' : `${namespace}.${key}`,
}));

// Mock next-intl/server — PrivacyPage calls getTranslations('privacy') and
// getTranslations('legal') (for TOC labels). The translator returns
// deterministic strings, and supports `.raw()` for the `section2Items` array.
const privacyTranslations: Record<string, unknown> = {
  title: 'Privacy Policy',
  lastUpdated: 'Last Updated',
  lastUpdatedDate: 'June 30, 2026',
  section1Title: 'Information We Collect',
  section1Body: 'We collect information you provide directly to us.',
  section2Title: 'How We Use Your Information',
  section2Body: 'We use the information we collect to:',
  section2Items: [
    'Respond to your inquiries and provide customer support',
    'Process and manage your support tickets',
    'Send transactional emails related to your requests',
    'Improve our website and services',
  ],
  section3Title: 'Information Sharing',
  section3Body: 'We do not sell your information.',
  section4Title: 'Data Security',
  section4Body: 'We implement appropriate security measures.',
  section5Title: 'Cookies',
  section5Body: 'We use essential cookies only.',
  section6Title: 'Your Rights',
  section6Body: 'You may request access to your data.',
  section7Title: 'Contact',
  section7Body: 'For privacy inquiries, contact us at',
  backHome: 'Back to Home',
};

const legalTranslations: Record<string, unknown> = {
  toc: 'On this page',
  print: 'Print this page',
};

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => {
    const store =
      namespace === 'privacy'
        ? privacyTranslations
        : namespace === 'legal'
          ? legalTranslations
          : {};
    const t = (key: string) => (key in store ? String(store[key]) : `${namespace}.${key}`);
    // `.raw()` returns the raw value (used for section2Items array).
    (t as unknown as { raw: (key: string) => unknown }).raw = (key: string) =>
      key in store ? store[key] : [`${namespace}.${key}`];
    return t;
  },
  getLocale: async () => 'en',
}));

describe('PrivacyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title as an h1', async () => {
    const ui = await PrivacyPage();
    render(ui);
    expect(
      screen.getByRole('heading', { name: 'Privacy Policy', level: 1 })
    ).toBeInTheDocument();
  });

  it('renders the "Last Updated" date', async () => {
    const ui = await PrivacyPage();
    render(ui);
    expect(screen.getByText('Last Updated:')).toBeInTheDocument();
    // Date now comes from process.env.NEXT_PUBLIC_BUILD_DATE with fallback
    // to '2026-07-19' when the env var is unset (e.g. test env).
    expect(screen.getByText('2026-07-19')).toBeInTheDocument();
  });

  it('renders all 7 numbered section headings', async () => {
    const ui = await PrivacyPage();
    render(ui);
    const expected = [
      '1. Information We Collect',
      '2. How We Use Your Information',
      '3. Information Sharing',
      '4. Data Security',
      '5. Cookies',
      '6. Your Rights',
      '7. Contact',
    ];
    expected.forEach((h) => {
      expect(screen.getByRole('heading', { name: h, level: 2 })).toBeInTheDocument();
    });
  });

  it('renders the section2Items list as 4 bullet items', async () => {
    const ui = await PrivacyPage();
    render(ui);
    // Scope to the section2 <ul> so we don't pick up the breadcrumb's <li>
    // elements (the Breadcrumb component renders 2 <li>s inside an <ol>).
    const section2List = document.querySelector('ul.list-disc');
    expect(section2List).not.toBeNull();
    const listItems = within(section2List as HTMLUListElement).getAllByRole('listitem');
    expect(listItems).toHaveLength(4);
    expect(
      screen.getByText('Respond to your inquiries and provide customer support')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Improve our website and services')
    ).toBeInTheDocument();
  });

  it('renders a "Back to Home" link pointing to /en/home', async () => {
    const ui = await PrivacyPage();
    render(ui);
    const link = screen.getByRole('link', { name: 'Back to Home' });
    expect(link).toHaveAttribute('href', '/en/home');
  });

  it('renders the support email as a mailto link in section 6 and 7', async () => {
    const ui = await PrivacyPage();
    render(ui);
    const mailtoLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('mailto:'));
    expect(mailtoLinks).toHaveLength(2);
    mailtoLinks.forEach((l) => {
      expect(l).toHaveAttribute('href', 'mailto:Inquiries@techguru-it.asia');
      expect(l).toHaveTextContent('Inquiries@techguru-it.asia');
    });
  });

  it('exposes a breadcrumb navigation landmark', async () => {
    const ui = await PrivacyPage();
    render(ui);
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
  });
});
