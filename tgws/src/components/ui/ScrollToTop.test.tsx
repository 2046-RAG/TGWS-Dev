import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ScrollToTop from './ScrollToTop';

vi.mock('next/navigation', () => ({
  usePathname: () => '/en/products',
}));

describe('ScrollToTop', () => {
  it('scrolls to top on mount and pathname change', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, writable: true });
    render(<ScrollToTop />);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
