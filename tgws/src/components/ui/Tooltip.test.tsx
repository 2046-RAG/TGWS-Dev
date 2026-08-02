import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  it('renders children and hides the tooltip by default', () => {
    render(
      <Tooltip content="help text">
        <span>trigger</span>
      </Tooltip>,
    );
    expect(screen.getByText('trigger')).toBeTruthy();
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('opacity-0');
    // Not described until visible
    expect(tooltip.getAttribute('id')).toBeTruthy();
  });

  it('shows the tooltip on mouse enter and hides on leave', () => {
    render(
      <Tooltip content="help text">
        <span>trigger</span>
      </Tooltip>,
    );
    const trigger = screen.getByText('trigger');
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip').className).toContain('opacity-100');
    fireEvent.mouseLeave(trigger);
    expect(screen.getByRole('tooltip').className).toContain('opacity-0');
  });

  it('shows on focus and hides on blur', () => {
    render(
      <Tooltip content="focus help">
        <span>trigger</span>
      </Tooltip>,
    );
    const trigger = screen.getByText('trigger');
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip').className).toContain('opacity-100');
    fireEvent.blur(trigger);
    expect(screen.getByRole('tooltip').className).toContain('opacity-0');
  });

  it('renders default help icon when no children given', () => {
    render(<Tooltip content="info" />);
    expect(screen.getByLabelText('More information')).toBeTruthy();
    expect(screen.getByRole('tooltip').textContent).toBe('info');
  });

  it('positions below when side=top and trigger near viewport top', () => {
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = () =>
      ({ top: 10, bottom: 30, left: 0, right: 50, width: 50, height: 20 } as DOMRect);
    render(
      <Tooltip content="flip help" side="top">
        <span>trigger</span>
      </Tooltip>,
    );
    const trigger = screen.getByText('trigger');
    fireEvent.mouseEnter(trigger);
    // Flips to bottom position class
    expect(screen.getByRole('tooltip').className).toContain('top-full');
    Element.prototype.getBoundingClientRect = original;
  });
});
