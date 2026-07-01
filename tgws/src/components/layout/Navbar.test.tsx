import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from './Navbar';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const m: Record<string, string> = {
      home: 'Home',
      products: 'Products',
      solutions: 'Solutions',
      caseStudies: 'Cases',
      blog: 'Blog',
      about: 'About',
      support: 'Support',
      contact: 'Contact',
    };
    return m[key] || key;
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...p }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...p}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/LanguageSwitcher', () => ({
  default: () => <button aria-label="lang">EN</button>,
}));

describe('Navbar', () => {
  it('renders logo with TechGuru, ® and ✳︎', () => {
    render(<Navbar />);
    expect(screen.getByText('TechGuru')).toBeInTheDocument();
    expect(screen.getByText('®')).toBeInTheDocument();
    expect(screen.getByText('✳︎')).toBeInTheDocument();
  });

  it('renders 7 desktop nav links', () => {
    render(<Navbar />);
    const expectedLinks = ['Home', 'Products', 'Solutions', 'Cases', 'Blog', 'About', 'Support'];
    expectedLinks.forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders contact link', () => {
    render(<Navbar />);
    const contactLinks = screen.getAllByText('Contact');
    expect(contactLinks.length).toBeGreaterThanOrEqual(1);
    expect(contactLinks[0]).toHaveAttribute('href', '/contact');
  });

  it('renders language switcher', () => {
    render(<Navbar />);
    const langButtons = screen.getAllByLabelText('lang');
    expect(langButtons.length).toBeGreaterThanOrEqual(1);
    const enTexts = screen.getAllByText('EN');
    expect(enTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('mobile menu toggle button is present', () => {
    render(<Navbar />);
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });
    expect(toggle).toBeInTheDocument();
  });

  it('mobile menu shows all links after toggle', () => {
    render(<Navbar />);
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(toggle);

    const expectedLinks = ['Home', 'Products', 'Solutions', 'Cases', 'Blog', 'About', 'Support', 'Contact'];
    expectedLinks.forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    });
  });
});
