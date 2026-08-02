import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

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

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    stubMatchMedia(false);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts in auto mode with the monitor icon', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: 'Theme: auto' });
    expect(btn).toBeInTheDocument();
  });

  it('cycles auto → light → dark on click', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Theme: auto' }));
    expect(screen.getByRole('button', { name: 'Theme: light' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Theme: light' }));
    expect(screen.getByRole('button', { name: 'Theme: dark' })).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('wraps around dark → auto', () => {
    localStorage.setItem('theme', 'dark');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Theme: dark' }));
    expect(screen.getByRole('button', { name: 'Theme: auto' })).toBeInTheDocument();
  });

  it('restores stored mode on mount', () => {
    localStorage.setItem('theme', 'light');
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Theme: light' })).toBeInTheDocument();
  });
});
