import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HelpText from './HelpText';

describe('HelpText', () => {
  it('renders the help text with an icon', () => {
    render(<HelpText text="This is a hint" />);
    expect(screen.getByText('This is a hint')).toBeTruthy();
    const icon = document.querySelector('svg');
    expect(icon).toBeTruthy();
  });

  it('applies the custom className', () => {
    const { container } = render(<HelpText text="hint" className="extra-class" />);
    const p = container.querySelector('p');
    expect(p!.className).toContain('extra-class');
  });
});
