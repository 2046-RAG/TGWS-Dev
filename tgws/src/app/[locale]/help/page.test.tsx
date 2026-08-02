import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpPage from './page';

vi.mock('next-intl', () => {
  const m: Record<string, string> = {
    title: 'Help Center', subtitle: 'Find answers', searchPlaceholder: 'Search help articles',
    noResults: 'No results found', noResultsHint: 'Try different terms',
    ctaTitle: 'Still need help?', ctaDesc: 'Contact us', ctaContact: 'Contact Us', ctaTicket: 'Submit Ticket',
    'categories.all': 'All', 'categories.product': 'Products', 'categories.technical': 'Technical',
    'categories.account': 'Account', 'categories.billing': 'Billing',
    'faqCounts.product': '2', 'faqCounts.technical': '1', 'faqCounts.account': '1', 'faqCounts.billing': '1',
    'faq.product.0.q': 'What solutions do you offer?', 'faq.product.0.a': 'Build, Run, Protect.',
    'faq.product.1.q': 'VMware migration?', 'faq.product.1.a': 'Yes.',
    'faq.technical.0.q': 'How to submit a ticket?', 'faq.technical.0.a': 'Go to Support.',
    'faq.account.0.q': 'How to create an account?', 'faq.account.0.a': 'Click Create Account.',
    'faq.billing.0.q': 'How is pricing structured?', 'faq.billing.0.a': 'Per project.',
  };
  const t = (key: string) => m[key] ?? key;
  return { useTranslations: () => t };
});

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('@/components/ui/Breadcrumb', () => ({ default: () => <nav data-testid="breadcrumb" /> }));
vi.mock('@/components/ui/FAQAccordion', () => ({
  default: ({ items }: { items: { question: string }[] }) => (
    <div data-testid="faq-accordion">{items.map(i => <div key={i.question}>{i.question}</div>)}</div>
  ),
}));
vi.mock('@/components/ui/JsonLd', () => ({
  FAQJsonLd: () => <div data-testid="faq-jsonld" />,
  BreadcrumbJsonLd: () => <div data-testid="breadcrumb-jsonld" />,
}));

describe('HelpPage', () => {
  it('renders all FAQ items across categories', () => {
    render(<HelpPage />);
    expect(screen.getByText('What solutions do you offer?')).toBeInTheDocument();
    expect(screen.getByText('VMware migration?')).toBeInTheDocument();
    expect(screen.getByText('How to submit a ticket?')).toBeInTheDocument();
    expect(screen.getByText('How to create an account?')).toBeInTheDocument();
    expect(screen.getByText('How is pricing structured?')).toBeInTheDocument();
  });

  it('filters by category', () => {
    render(<HelpPage />);
    fireEvent.click(screen.getAllByRole('button').find(b => b.textContent === 'Technical')!);
    expect(screen.getByText('How to submit a ticket?')).toBeInTheDocument();
    expect(screen.queryByText('What solutions do you offer?')).not.toBeInTheDocument();
  });

  it('searches FAQ items', () => {
    render(<HelpPage />);
    fireEvent.change(screen.getByPlaceholderText('Search help articles'), { target: { value: 'vmware' } });
    expect(screen.getByText('VMware migration?')).toBeInTheDocument();
    expect(screen.queryByText('How to submit a ticket?')).not.toBeInTheDocument();
  });

  it('shows no-results state for unmatched search', () => {
    render(<HelpPage />);
    fireEvent.change(screen.getByPlaceholderText('Search help articles'), { target: { value: 'zzz' } });
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders CTA links', () => {
    render(<HelpPage />);
    const contact = screen.getByText('Contact Us').closest('a');
    expect(contact?.getAttribute('href')).toBe('/en/contact');
    const ticket = screen.getByText('Submit Ticket').closest('a');
    expect(ticket?.getAttribute('href')).toBe('/en/support');
  });
});
