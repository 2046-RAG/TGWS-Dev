import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DarkModeToggle from './DarkModeToggle';

function stubMatchMedia(matches: boolean) {
  const listeners: (() => void)[] = [];
  const mq = {
    matches,
    addEventListener: (_t: string, cb: () => void) => { listeners.push(cb); },
    removeEventListener: () => {},
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mq));
  return { listeners, mq };
}

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    stubMatchMedia(false); // system = light
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders three theme radio buttons', () => {
    render(<DarkModeToggle />);
    expect(screen.getByRole('radio', { name: 'Theme: auto' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Theme: light' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Theme: dark' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Theme: auto' }).getAttribute('aria-checked')).toBe('true');
  });

  it('selects dark mode, stores it and toggles the dark class', () => {
    render(<DarkModeToggle />);
    fireEvent.click(screen.getByRole('radio', { name: 'Theme: dark' }));
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('radio', { name: 'Theme: dark' }).getAttribute('aria-checked')).toBe('true');
  });

  it('switches back to light mode', () => {
    render(<DarkModeToggle />);
    fireEvent.click(screen.getByRole('radio', { name: 'Theme: dark' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Theme: light' }));
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('restores the stored dark preference on mount', () => {
    localStorage.setItem('theme', 'dark');
    render(<DarkModeToggle />);
    expect(screen.getByRole('radio', { name: 'Theme: dark' }).getAttribute('aria-checked')).toBe('true');
  });

  it('auto mode follows system preference', () => {
    stubMatchMedia(true); // system = dark
    localStorage.setItem('theme', 'auto');
    render(<DarkModeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies theme change when system preference flips in auto mode', () => {
    const { listeners, mq } = stubMatchMedia(false);
    localStorage.setItem('theme', 'auto');
    render(<DarkModeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => {
      mq.matches = true;
      listeners.forEach((cb) => cb());
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
