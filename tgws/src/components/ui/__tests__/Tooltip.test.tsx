import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tooltip from '../Tooltip';

// getBoundingClientRect is used to flip the tooltip side if it would
// overflow. We mock it to return a safe rect by default so the side
// stays as the `side` prop.
function mockBoundingClientRect(top = 100, bottom = 200) {
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    top,
    bottom,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })) as unknown as typeof Element.prototype.getBoundingClientRect;
}

describe('Tooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBoundingClientRect();
    // jsdom doesn't implement innerHeight; default it.
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  it('renders the default HelpCircle trigger button', () => {
    render(<Tooltip content="Helpful info" />);
    const trigger = screen.getByRole('button', { name: 'More information' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('tabindex', '0');
  });

  it('renders the tooltip text in a `role="tooltip"` element', () => {
    render(<Tooltip content="My tooltip text" />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('My tooltip text');
  });

  it('tooltip is hidden (opacity-0) by default and shown (opacity-100) on mouseenter', () => {
    render(<Tooltip content="Hover me" />);
    const trigger = screen.getByRole('button', { name: 'More information' });
    const tooltip = screen.getByRole('tooltip');

    expect(tooltip.className).toContain('opacity-0');

    fireEvent.mouseEnter(trigger);
    expect(tooltip.className).toContain('opacity-100');

    fireEvent.mouseLeave(trigger);
    expect(tooltip.className).toContain('opacity-0');
  });

  it('tooltip visibility toggles on focus/blur (keyboard a11y)', () => {
    render(<Tooltip content="Focus me" />);
    const trigger = screen.getByRole('button', { name: 'More information' });
    const tooltip = screen.getByRole('tooltip');

    expect(tooltip.className).toContain('opacity-0');

    fireEvent.focus(trigger);
    expect(tooltip.className).toContain('opacity-100');

    fireEvent.blur(trigger);
    expect(tooltip.className).toContain('opacity-0');
  });

  it('renders a custom child trigger instead of the default icon button', () => {
    render(
      <Tooltip content="Custom child content">
        <button type="button">Custom trigger</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: 'Custom trigger' });
    expect(trigger).toBeInTheDocument();
    // The default "More information" icon button should NOT be rendered.
    expect(screen.queryByRole('button', { name: 'More information' })).not.toBeInTheDocument();
  });

  it('applies the `top` position class by default', () => {
    render(<Tooltip content="Top tip" />);
    const tooltip = screen.getByRole('tooltip');
    // Bottom positioning classes are absent; top positioning includes `bottom-full`.
    expect(tooltip.className).toContain('bottom-full');
  });

  it('applies the `bottom` position class when side="bottom"', () => {
    // For side="bottom", the effect checks rect.bottom > innerHeight - 48.
    // With default mock rect.bottom=200 and innerHeight=800, the condition
    // is false, so position stays as 'bottom'.
    render(<Tooltip content="Bottom tip" side="bottom" />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('top-full');
  });

  it('flips from top to bottom when the tooltip would overflow the top of the viewport', () => {
    // rect.top < 48 -> flip to bottom
    mockBoundingClientRect(10, 110);
    render(<Tooltip content="Flip" side="top" />);
    // Tooltip starts at 'top' position; the effect should flip to 'bottom'
    // after mouseenter (because visible triggers the effect).
    const trigger = screen.getByRole('button', { name: 'More information' });
    fireEvent.mouseEnter(trigger);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('top-full');
  });

  it('flips from bottom to top when the tooltip would overflow the bottom of the viewport', () => {
    // rect.bottom > innerHeight - 48 -> flip to top
    mockBoundingClientRect(600, 800);
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
    render(<Tooltip content="Flip up" side="bottom" />);
    const trigger = screen.getByRole('button', { name: 'More information' });
    fireEvent.mouseEnter(trigger);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('bottom-full');
  });

  it('sets aria-describedby on the trigger only when the tooltip is visible', () => {
    render(<Tooltip content="Aria test" />);
    const trigger = screen.getByRole('button', { name: 'More information' });
    // aria-describedby lives on the wrapping span (the element with the
    // triggerRef), not on the button itself — the button is a child of
    // the span. Query the wrapping span via .closest().
    const wrapper = trigger.closest('span[aria-describedby], span.relative');
    expect(wrapper).not.toBeNull();

    // Hidden initially -> no aria-describedby.
    expect(wrapper!.getAttribute('aria-describedby')).toBeNull();

    fireEvent.mouseEnter(trigger);
    const describedBy = wrapper!.getAttribute('aria-describedby');
    expect(describedBy).not.toBeNull();
    // The value should match the tooltip element's id.
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.id).toBe(describedBy);
  });
});
