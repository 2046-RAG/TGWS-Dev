import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from './page';

vi.mock('next-intl', () => {
  const m: Record<string, string> = {
    valueSectionTitle: 'Build. Run. Protect.', valueSectionDesc: 'Three pillars',
    aiJourneyTitle: 'AI Journey', aiJourneyDesc: 'Three steps',
  };
  const t = (key: string) => m[key] ?? key;
  return { useTranslations: () => t };
});

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="hero" />,
}));

vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={String(props.alt)} /> }));

describe('HomePage', () => {
  it('renders hero and core value sections', () => {
    render(<HomePage />);
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByText('Build. Run. Protect.')).toBeInTheDocument();
  });

  it('renders technology partners with marquee rows', () => {
    render(<HomePage />);
    expect(screen.getByText('Technology Partners')).toBeInTheDocument();
    // marquee rows exist
    const marquees = document.querySelectorAll('[class*="animate-marquee"]');
    expect(marquees.length).toBeGreaterThanOrEqual(2);
  });

  it('pauses marquee on hover', () => {
    render(<HomePage />);
    const marquee = document.querySelector('[class*="animate-marquee-left"]') as HTMLElement;
    const container = marquee!.parentElement!.parentElement!;
    expect(marquee.style.animationPlayState).toBe('running');
    fireEvent.mouseEnter(container);
    expect(marquee.style.animationPlayState).toBe('paused');
    fireEvent.mouseLeave(container);
    expect(marquee.style.animationPlayState).toBe('running');
  });
});
