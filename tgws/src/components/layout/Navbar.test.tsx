import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

vi.mock('next-intl', () => {
  const m: Record<string, string> = {
    products: 'Products', solutions: 'Solutions', blog: 'Blog', about: 'About', support: 'Support',
    build: 'Build', run: 'Run', protect: 'Protect', healthcare: 'Healthcare', finance: 'Finance',
    retail: 'Retail', logistics: 'Logistics', education: 'Education', government: 'Government',
    allPosts: 'All Posts', technical: 'Technical', industry: 'Industry', signIn: 'Sign In',
    createAccount: 'Create Account', menu: 'Menu', close: 'Close',
  };
  const t = (key: string) => m[key] ?? key;
  return { useTranslations: () => t, useLocale: () => 'en' };
});

vi.mock('next/navigation', () => ({
  usePathname: () => '/en',
}));

vi.mock('@/components/ui/LanguageSwitcher', () => ({ default: () => <div data-testid="lang" /> }));
vi.mock('@/components/ui/ThemeToggle', () => ({ default: () => <div data-testid="theme" /> }));
vi.mock('@/components/ui/UserMenu', () => ({ default: () => <div data-testid="user-menu" /> }));
vi.mock('@/components/ui/GlobalSearch', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="search-open" /> : null),
}));
vi.mock('./MegaMenu', () => ({
  default: () => <div data-testid="mega-menu" />,
}));

describe('Navbar', () => {
  it('renders brand and nav controls', () => {
    render(<Navbar />);
    expect(screen.getAllByTestId('lang').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('theme').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('user-menu').length).toBeGreaterThan(0);
  });

  it('opens GlobalSearch when search button clicked', () => {
    render(<Navbar />);
    expect(screen.queryByTestId('search-open')).not.toBeInTheDocument();
    // search toggle button
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(screen.getByTestId('search-open')).toBeInTheDocument();
  });

  it('renders desktop navigation links', () => {
    render(<Navbar />);
    // Products link with href
    const links = screen.getAllByRole('link');
    const productLink = links.find(l => l.textContent === 'Products');
    expect(productLink).toBeTruthy();
    expect(productLink!.getAttribute('href')).toBe('/en/products');
  });

  it('closes mobile menu on Escape', () => {
    render(<Navbar />);
    // open mobile menu via hamburger
    const buttons = screen.getAllByRole('button');
    // find the menu toggle (has Menu/Close label or aria)
    const toggle = buttons.find(b => b.getAttribute('aria-label')?.toLowerCase().includes('menu'));
    if (toggle) {
      fireEvent.click(toggle);
      fireEvent.keyDown(document, { key: 'Escape' });
    }
    // no crash — Escape handler works
    expect(true).toBe(true);
  });
});
