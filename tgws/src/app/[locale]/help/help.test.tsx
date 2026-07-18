import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HelpPage from './page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

// Mock next-intl — return namespace-qualified keys except for `faqCounts.*`
// which must return real numbers so the `Number(t('faqCounts.product'))`
// loops produce the expected FAQ items.
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    const faqCounts: Record<string, string> = {
      product: '2',
      technical: '2',
      account: '1',
      billing: '1',
    };
    return (key: string) => {
      if (namespace === 'help' && key.startsWith('faqCounts.')) {
        return faqCounts[key.split('.')[1]] ?? '0';
      }
      // Simulate the FAQ content keys so we can search/filter them.
      if (namespace === 'help' && key.startsWith('faq.')) {
        // e.g. "faq.product.0.q" -> "help.faq.product.0.q"
        return `${namespace}.${key}`;
      }
      return `${namespace}.${key}`;
    };
  },
}));

describe('HelpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use fake timers so the 300ms search debounce is deterministic.
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the page title and subtitle', () => {
    render(<HelpPage />);
    expect(
      screen.getByRole('heading', { name: 'help.title' })
    ).toBeInTheDocument();
    expect(screen.getByText('help.subtitle')).toBeInTheDocument();
  });

  it('renders the search input with i18n placeholder and aria-label', () => {
    render(<HelpPage />);
    const search = screen.getByRole('searchbox');
    expect(search).toHaveAttribute('placeholder', 'help.searchPlaceholder');
    expect(search).toHaveAttribute('aria-label', 'help.searchPlaceholder');
  });

  it('renders all 5 category filter tabs (all, product, technical, account, billing)', () => {
    render(<HelpPage />);
    const tabs = screen.getAllByRole('button');
    const labels = tabs.map((t) => t.textContent ?? '');
    expect(labels).toContain('help.categories.all');
    expect(labels).toContain('help.categories.product');
    expect(labels).toContain('help.categories.technical');
    expect(labels).toContain('help.categories.account');
    expect(labels).toContain('help.categories.billing');
  });

  it('renders all FAQ items as accordion buttons (6 total: 2+2+1+1)', () => {
    render(<HelpPage />);
    // FAQAccordion renders each question as a <button> with aria-expanded.
    const faqButtons = screen.getAllByRole('button', { expanded: false });
    // 5 category tabs + 6 FAQ buttons = 11 buttons total. We just assert
    // the 6 FAQ buttons exist by looking for the question text patterns.
    expect(faqButtons.length).toBeGreaterThanOrEqual(6);
    expect(screen.getByText('help.faq.product.0.q')).toBeInTheDocument();
    expect(screen.getByText('help.faq.product.1.q')).toBeInTheDocument();
    expect(screen.getByText('help.faq.technical.0.q')).toBeInTheDocument();
    expect(screen.getByText('help.faq.technical.1.q')).toBeInTheDocument();
    expect(screen.getByText('help.faq.account.0.q')).toBeInTheDocument();
    expect(screen.getByText('help.faq.billing.0.q')).toBeInTheDocument();
  });

  it('filters FAQs by search query after the 300ms debounce', async () => {
    render(<HelpPage />);
    const search = screen.getByRole('searchbox');

    // Initially all 6 FAQ questions are visible.
    expect(screen.getByText('help.faq.product.0.q')).toBeInTheDocument();

    // Type a query that only matches one question.
    fireEvent.change(search, { target: { value: 'product.1' } });

    // Immediately after typing the filter has NOT yet been applied — the
    // debounce timer is still pending so the previous results remain.
    expect(screen.getByText('help.faq.product.0.q')).toBeInTheDocument();

    // Advance fake timers past the 300ms debounce window. Wrap in act()
    // so the resulting state update (setSearchQuery) is flushed cleanly.
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('help.faq.product.0.q')).not.toBeInTheDocument();
    expect(screen.getByText('help.faq.product.1.q')).toBeInTheDocument();
  });

  it('shows the no-results state (with query) when search matches nothing', async () => {
    render(<HelpPage />);
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'zzz-no-match-zzz' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // The empty state should use the new `noResultsQuery` copy (not the
    // legacy `noResults`), since the search box has a non-empty query.
    expect(screen.getByText('help.noResultsQuery')).toBeInTheDocument();
    expect(screen.getByText('help.noResultsHint')).toBeInTheDocument();
  });

  it('filters by category when a category tab is clicked', () => {
    render(<HelpPage />);
    // Click the "billing" category tab
    const billingTab = screen
      .getAllByRole('button')
      .find((b) => b.textContent === 'help.categories.billing');
    expect(billingTab).toBeDefined();
    fireEvent.click(billingTab!);

    // Only the billing FAQ should be visible
    expect(screen.queryByText('help.faq.product.0.q')).not.toBeInTheDocument();
    expect(screen.getByText('help.faq.billing.0.q')).toBeInTheDocument();
  });

  it('renders the Contact CTA section with two links', () => {
    render(<HelpPage />);
    expect(
      screen.getByRole('heading', { name: 'help.ctaTitle' })
    ).toBeInTheDocument();
    expect(screen.getByText('help.ctaDesc')).toBeInTheDocument();
    // "Contact Us" link -> /en/contact
    const contactLink = screen.getByRole('link', { name: 'help.ctaContact' });
    expect(contactLink).toHaveAttribute('href', '/en/contact');
    // "Submit a Ticket" link -> /en/support
    const ticketLink = screen.getByRole('link', { name: 'help.ctaTicket' });
    expect(ticketLink).toHaveAttribute('href', '/en/support');
  });

  it('exposes a breadcrumb navigation landmark', () => {
    render(<HelpPage />);
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
  });

  it('injects FAQPage + BreadcrumbList JSON-LD scripts', () => {
    const { container } = render(<HelpPage />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThanOrEqual(2);
    const types = Array.from(scripts).map((s) => {
      const parsed = JSON.parse(s.textContent ?? '{}');
      return parsed['@type'];
    });
    expect(types).toContain('FAQPage');
    expect(types).toContain('BreadcrumbList');
  });

  it('exposes every FAQ item in the FAQPage JSON-LD (not just filtered subset)', () => {
    const { container } = render(<HelpPage />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    const faqScript = Array.from(scripts)
      .map((s) => JSON.parse(s.textContent ?? '{}'))
      .find((parsed) => parsed['@type'] === 'FAQPage');
    expect(faqScript).toBeDefined();
    // faqCounts: product=2, technical=2, account=1, billing=1 → 6 total.
    // FAQJsonLd must receive ALL items so SEO reflects the full content.
    expect(faqScript.mainEntity.length).toBe(6);
  });
});
