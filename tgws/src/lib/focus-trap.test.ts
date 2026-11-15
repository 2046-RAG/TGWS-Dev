import { describe, it, expect, afterEach } from 'vitest';
import { getFocusable, trapTabKey } from './focus-trap';

function makeContainer() {
  const container = document.createElement('div');
  const first = document.createElement('button');
  const last = document.createElement('button');
  first.textContent = 'first';
  last.textContent = 'last';
  container.append(first, last);
  document.body.append(container);
  return { container, first, last };
}

function key(shiftKey = false) {
  return new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('focus-trap (T-080)', () => {
  it('collects focusable elements inside the container', () => {
    const { container, first, last } = makeContainer();
    expect(getFocusable(container)).toEqual([first, last]);
  });

  it('wraps Tab from the last element back to the first', () => {
    const { container, first, last } = makeContainer();
    last.focus();
    const event = key();
    trapTabKey(event, container);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);
  });

  it('wraps Shift+Tab from the first element to the last', () => {
    const { container, first, last } = makeContainer();
    first.focus();
    const event = key(true);
    trapTabKey(event, container);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(last);
  });

  it('pulls focus into the container when it is outside', () => {
    const { container, first } = makeContainer();
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    const event = key();
    trapTabKey(event, container);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);
  });

  it('prevents Tab from escaping an empty container', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const event = key();
    trapTabKey(event, container);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores non-Tab keys', () => {
    const { container, last } = makeContainer();
    last.focus();
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    trapTabKey(event, container);
    expect(event.defaultPrevented).toBe(false);
  });
});
