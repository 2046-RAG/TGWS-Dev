import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroSection from './HeroSection';

vi.mock('next-intl', () => {
  const m: Record<string, string> = {
    'tagline': 'Future-proof your infrastructure',
    'heroLabel.line1': 'Build', 'heroLabel.line2': 'Run. Protect.',
    'cta.solutions': 'Solutions', 'cta.demo': 'Book a Demo', 'cta.vmware': 'VMware Alternatives',
    'storyline1Title': 'Build', 'storyline1Sub': 'AI & cloud', 'storyline1Desc': 'Desc1',
    'storyline2Title': 'Run', 'storyline2Sub': 'Infrastructure', 'storyline2Desc': 'Desc2',
    'storyline3Title': 'Protect', 'storyline3Sub': 'Security', 'storyline3Desc': 'Desc3',
  };
  const t = (key: string) => m[key] ?? key;
  return { useTranslations: () => t };
});

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

describe('HeroSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders hero labels, email and storyline titles', () => {
    render(<HeroSection />);
    expect(screen.getAllByText('Build').length).toBeGreaterThan(0);
    expect(screen.getByText('Run. Protect.')).toBeInTheDocument();
    expect(screen.getByText('Inquiries@techguru-it.asia')).toBeInTheDocument();
    expect(screen.getAllByText('Run').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Protect').length).toBeGreaterThan(0);
  });

  it('types the tagline progressively via typewriter', () => {
    render(<HeroSection />);
    // Initially empty
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('');

    // Advance past start delay then some typing
    act(() => { vi.advanceTimersByTime(700); });
    act(() => { vi.advanceTimersByTime(38 * 5); });
    expect(h1.textContent!.length).toBeGreaterThan(0);
    expect(h1.textContent!.length).toBeLessThan('Future-proof your infrastructure'.length);

    // Finish typing
    act(() => { vi.advanceTimersByTime(38 * 60); });
    expect(h1.textContent).toBe('Future-proof your infrastructure');
  });

  it('shows CTA buttons after the reveal delay', () => {
    const { rerender } = render(<HeroSection />);
    // Before the delay the buttons container has opacity-0
    const container = screen.getByText('Solutions').closest('a')!.parentElement!;
    expect(container.className).toContain('opacity-0');
    act(() => { vi.advanceTimersByTime(500); });
    rerender(<HeroSection />);
    expect(container.className).toContain('opacity-100');
  });

  it('copies email via clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<HeroSection />);
    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.click(screen.getByText('Inquiries@techguru-it.asia'));
    // flush the async clipboard promise
    await act(async () => { await Promise.resolve(); });
    expect(writeText).toHaveBeenCalledWith('Inquiries@techguru-it.asia');
    // Copied checkmark appears
    act(() => { vi.advanceTimersByTime(100); });
    expect(document.querySelector('svg.lucide-check')).toBeTruthy();
    // Resets after 2s
    act(() => { vi.advanceTimersByTime(2500); });
    expect(document.querySelector('svg.lucide-check')).toBeFalsy();
  });

  it('falls back to textarea execCommand when clipboard is unavailable', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;
    render(<HeroSection />);
    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.click(screen.getByText('Inquiries@techguru-it.asia'));
    await act(async () => { await Promise.resolve(); });
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('scrolls down when the scroll hint is clicked', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    render(<HeroSection />);
    fireEvent.click(screen.getByLabelText('Scroll down'));
    expect(scrollTo).toHaveBeenCalledWith({ top: 800, behavior: 'smooth' });
  });

  it('renders the three storyline links with correct hrefs', () => {
    render(<HeroSection />);
    expect(screen.getByText('Solutions').closest('a')!.getAttribute('href')).toBe('/en/products');
    expect(screen.getByText('Book a Demo').closest('a')!.getAttribute('href')).toBe('/en/contact');
    expect(screen.getByText('VMware Alternatives').closest('a')!.getAttribute('href')).toBe('/en/vmware-alternative');
  });
});
