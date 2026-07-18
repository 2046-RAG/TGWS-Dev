import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ScrollToTop from '../ScrollToTop';

// ScrollToTop calls usePathname from next/navigation. The effect then
// calls window.scrollTo(0,0) whenever the pathname changes.
const mockPathname = vi.hoisted(() => ({ current: '/en/initial' }));

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname.current,
}));

describe('ScrollToTop', () => {
  beforeEach(() => {
    mockPathname.current = '/en/initial';
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing (returns null)', () => {
    const { container } = render(<ScrollToTop />);
    expect(container.firstChild).toBeNull();
  });

  it('calls window.scrollTo(0, 0) on mount', () => {
    render(<ScrollToTop />);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('calls window.scrollTo again when the pathname changes', () => {
    const { rerender } = render(<ScrollToTop />);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    mockPathname.current = '/en/products';
    rerender(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);
  });

  it('does not call window.scrollTo on re-render with the same pathname', () => {
    const { rerender } = render(<ScrollToTop />);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    // Re-render with the same pathname — no new call.
    rerender(<ScrollToTop />);
    rerender(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });
});
