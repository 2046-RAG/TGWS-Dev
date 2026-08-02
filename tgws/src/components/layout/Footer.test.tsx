import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from './Footer';

vi.mock('next-intl', () => {
  const m: Record<string, string> = {
    products: 'Products', solutions: 'Solutions', company: 'Company', support: 'Support',
    build: 'Build', run: 'Run', protect: 'Protect',
    healthcare: 'Healthcare', finance: 'Finance', retail: 'Retail',
    logistics: 'Logistics', education: 'Education', government: 'Government',
    aboutUs: 'About Us', blog: 'Blog', contact: 'Contact',
    tickets: 'Tickets', faq: 'FAQ', newsletter: 'Newsletter', subscribe: 'Subscribe',
    emailPlaceholder: 'Your email', subscribed: 'Subscribed!',
  };
  const t = (key: string) => m[key] ?? key;
  return { useTranslations: () => t, useLocale: () => 'en' };
});

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

describe('Footer', () => {
  it('renders navigation columns with locale-prefixed links', () => {
    render(<Footer />);
    expect(screen.getByText('Products')).toBeInTheDocument();
    const vmware = screen.getByText('VMware Alternatives').closest('a')!;
    expect(vmware.getAttribute('href')).toBe('/en/vmware-alternative');
    const build = screen.getByText('Build').closest('a')!;
    expect(build.getAttribute('href')).toBe('/en/products#build');
    const healthcare = screen.getByText('Healthcare').closest('a')!;
    expect(healthcare.getAttribute('href')).toBe('/en/solutions?tab=healthcare');
  });

  it('subscribes to newsletter and shows confirmation', () => {
    render(<Footer />);
    const input = screen.getByPlaceholderText('Your email') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText('Subscribe'));
    // form replaced by confirmation text
    expect(screen.getByText('Subscribe!')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Your email')).not.toBeInTheDocument();
  });

  it('ignores empty email on subscribe', () => {
    render(<Footer />);
    fireEvent.click(screen.getByText('Subscribe'));
    expect(screen.queryByText('Subscribe!')).not.toBeInTheDocument();
  });
});
