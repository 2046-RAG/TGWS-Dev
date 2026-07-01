import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeroSection from './HeroSection';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const m: Record<string, string> = {
      tagline: 'Your Technology Partner',
      'heroLabel.line1': 'TechGuru',
      'heroLabel.line2': 'Solutions',
      'cta.solutions': 'Solutions',
      'cta.cases': 'Cases',
      'cta.demo': 'Demo',
      'cta.vmware': 'VMware',
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

describe('HeroSection', () => {
  it('renders video background with correct attributes', () => {
    render(<HeroSection />);
    const video = document.querySelector('video') as HTMLVideoElement;
    expect(video).toBeInTheDocument();
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'auto');
  });

  it('renders 4 CTA links with correct hrefs', () => {
    render(<HeroSection />);
    const links = screen.getAllByRole('link');
    const ctaLinks = links.filter((link) =>
      ['/solutions', '/case-studies', '/contact', '/products'].includes(link.getAttribute('href') ?? '')
    );
    expect(ctaLinks).toHaveLength(4);
    expect(ctaLinks[0]).toHaveAttribute('href', '/solutions');
    expect(ctaLinks[1]).toHaveAttribute('href', '/case-studies');
    expect(ctaLinks[2]).toHaveAttribute('href', '/contact');
    expect(ctaLinks[3]).toHaveAttribute('href', '/products');
  });

  it('renders email copy button', () => {
    render(<HeroSection />);
    const emailButton = screen.getByRole('button');
    expect(emailButton).toBeInTheDocument();
    expect(emailButton.textContent).toContain('info@techguru-it.asia');
  });

  it('starts typewriter effect after delay', async () => {
    render(<HeroSection />);
    await waitFor(() => {
      expect(screen.getByText(/Your Technology Partner/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders blurred label', () => {
    render(<HeroSection />);
    expect(screen.getByText('TechGuru')).toBeInTheDocument();
    const solutionsElements = screen.getAllByText('Solutions');
    expect(solutionsElements.length).toBeGreaterThanOrEqual(1);
  });

  it('scroll indicator is present', () => {
    render(<HeroSection />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
