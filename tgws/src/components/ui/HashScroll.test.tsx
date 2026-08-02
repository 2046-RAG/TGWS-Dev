import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import HashScroll from './HashScroll';

vi.mock('next/navigation', () => ({
  usePathname: () => '/en/vmware-alternative',
}));

describe('HashScroll', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="tco-calculator"></div>';
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does nothing when no hash present', () => {
    Object.defineProperty(window, 'location', { value: { hash: '' }, writable: true });
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<HashScroll />);
    act(() => { vi.advanceTimersByTime(500); });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls to the hashed element', () => {
    Object.defineProperty(window, 'location', { value: { hash: '#tco-calculator' }, writable: true });
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<HashScroll />);
    act(() => { vi.advanceTimersByTime(400); });
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('retries when element not yet present', () => {
    Object.defineProperty(window, 'location', { value: { hash: '#late-element' }, writable: true });
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<HashScroll />);
    act(() => { vi.advanceTimersByTime(300); });
    // element appears after 2 retries
    act(() => {
      document.body.innerHTML = '<div id="late-element"></div>';
      vi.advanceTimersByTime(500);
    });
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('gives up after 30 retries', () => {
    Object.defineProperty(window, 'location', { value: { hash: '#never' }, writable: true });
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<HashScroll />);
    act(() => { vi.advanceTimersByTime(7000); }); // > 30 attempts
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
