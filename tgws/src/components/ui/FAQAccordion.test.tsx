import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQAccordion from './FAQAccordion';

const items = [
  { question: 'Q1?', answer: 'A1' },
  { question: 'Q2?', answer: 'A2' },
];

describe('FAQAccordion', () => {
  it('renders all questions with collapsed answers', () => {
    render(<FAQAccordion items={items} />);
    expect(screen.getByText('Q1?')).toBeInTheDocument();
    expect(screen.getByText('Q2?')).toBeInTheDocument();
    // answers hidden by default (max-h-0)
    const answers = screen.getAllByRole('region');
    expect(answers[0].className).toContain('max-h-0');
  });

  it('expands the clicked item and collapses on second click', () => {
    render(<FAQAccordion items={items} />);
    const btn = screen.getByText('Q1?').closest('button')!;
    expect(btn.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    const answers = screen.getAllByRole('region');
    expect(answers[0].className).toContain('max-h-96');

    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows only one open item at a time', () => {
    render(<FAQAccordion items={items} />);
    const btn1 = screen.getByText('Q1?').closest('button')!;
    const btn2 = screen.getByText('Q2?').closest('button')!;
    fireEvent.click(btn1);
    fireEvent.click(btn2);
    expect(btn1.getAttribute('aria-expanded')).toBe('false');
    expect(btn2.getAttribute('aria-expanded')).toBe('true');
  });
});
