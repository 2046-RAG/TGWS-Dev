import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DarkModeToggle from '../DarkModeToggle';

// Helper: configure matchMedia for prefers-color-scheme.
function setSystemTheme(theme: 'light' | 'dark') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? theme === 'dark' : false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated but jsdom still uses it
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('DarkModeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    setSystemTheme('light');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a placeholder div before mounting to avoid hydration mismatch', () => {
    // First render (mounted=false) returns the placeholder div.
    const { container } = render(<DarkModeToggle />);
    const placeholder = container.querySelector('.w-11.h-11');
    expect(placeholder).not.toBeNull();
  });

  it('renders the toggle button after mount and defaults to system theme (light)', async () => {
    setSystemTheme('light');
    render(<DarkModeToggle />);
    const btn = await screen.findByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(btn).toHaveAttribute('title', 'Light mode');
  });

  it('reflects a stored "dark" preference on mount', async () => {
    window.localStorage.setItem('theme', 'dark');
    render(<DarkModeToggle />);
    const btn = await screen.findByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Switch to light mode');
    expect(btn).toHaveAttribute('title', 'Dark mode');
    // The toggle should also have applied the .dark class to <html>.
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles from dark to light when clicked, persisting to localStorage', async () => {
    window.localStorage.setItem('theme', 'dark');
    render(<DarkModeToggle />);
    const btn = await screen.findByRole('button');

    act(() => {
      fireEvent.click(btn);
    });

    expect(window.localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles from light to dark when clicked, persisting to localStorage', async () => {
    setSystemTheme('light');
    render(<DarkModeToggle />);
    const btn = await screen.findByRole('button');

    act(() => {
      fireEvent.click(btn);
    });

    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('falls back to system theme when no stored preference exists', async () => {
    setSystemTheme('dark');
    render(<DarkModeToggle />);
    const btn = await screen.findByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Switch to light mode');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('ignores invalid localStorage values and uses system theme', async () => {
    window.localStorage.setItem('theme', 'banana');
    setSystemTheme('light');
    render(<DarkModeToggle />);
    const btn = await screen.findByRole('button');
    // Invalid stored value -> use system -> light -> aria-label says "switch to dark"
    expect(btn).toHaveAttribute('aria-label', 'Switch to dark mode');
  });
});
