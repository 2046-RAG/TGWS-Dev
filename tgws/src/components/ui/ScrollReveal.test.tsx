import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import ScrollReveal from './ScrollReveal';

vi.mock('next/navigation', () => ({
  usePathname: () => '/en',
}));

class FakeObserver {
  static instances: FakeObserver[] = [];
  observed: Element[] = [];
  private cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    FakeObserver.instances.push(this);
  }
  observe(el: Element) { this.observed.push(el); }
  unobserve(_el: Element) {}
  disconnect() {}
  // helper for tests
  fire(entries: { target: Element; isIntersecting: boolean }[]) {
    this.cb(entries as unknown as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}

describe('ScrollReveal', () => {
  beforeEach(() => {
    FakeObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('reveals all elements immediately when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    document.body.innerHTML = '<div class="scroll-reveal">a</div><div class="scroll-reveal">b</div>';
    render(<ScrollReveal />);
    expect(document.querySelectorAll('.scroll-reveal.revealed')).toHaveLength(2);
  });

  it('observes elements with IntersectionObserver when motion allowed', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.useFakeTimers();
    document.body.innerHTML = '<div class="scroll-reveal">a</div>';
    render(<ScrollReveal />);
    act(() => { vi.advanceTimersByTime(60); });
    expect(FakeObserver.instances.length).toBe(1);
    expect(FakeObserver.instances[0].observed).toHaveLength(1);
  });

  it('adds revealed class when an observed element intersects', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.useFakeTimers();
    document.body.innerHTML = '<div class="scroll-reveal" id="el">a</div>';
    render(<ScrollReveal />);
    act(() => { vi.advanceTimersByTime(60); });
    const el = document.getElementById('el')!;
    act(() => {
      FakeObserver.instances[0].fire([{ target: el, isIntersecting: true }]);
    });
    expect(el.classList.contains('revealed')).toBe(true);
  });
});
