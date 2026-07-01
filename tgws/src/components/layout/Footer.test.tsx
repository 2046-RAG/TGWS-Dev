import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from './Footer';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      products: 'Products',
      build: 'Build',
      run: 'Run',
      protect: 'Protect',
      solutions: 'Solutions',
      healthcare: 'Healthcare',
      finance: 'Finance',
      retail: 'Retail',
      company: 'Company',
      aboutUs: 'About Us',
      blog: 'Blog',
      contact: 'Contact',
      support: 'Support',
      tickets: 'Tickets',
      faq: 'FAQ',
      copyright: '© 2026 TechGuru Network & Data Solutions Inc. All rights reserved.',
      privacy: 'Privacy',
      terms: 'Terms',
    };
    return translations[key] || key;
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Footer', () => {
  it('renders footer with all sections', () => {
    render(<Footer />);
    
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Solutions')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('renders copyright text', () => {
    render(<Footer />);
    
    expect(screen.getByText(/© 2026 TechGuru/)).toBeInTheDocument();
  });

  it('renders privacy and terms links', () => {
    render(<Footer />);
    
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
  });
});
