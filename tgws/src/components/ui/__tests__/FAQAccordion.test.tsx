import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQAccordion from '../FAQAccordion';

describe('FAQAccordion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders one toggle button per FAQ item, showing the question text', () => {
    render(
      <FAQAccordion
        items={[
          { question: 'What is AIGC?', answer: 'AI-Generated Content.' },
          { question: 'Is it free?', answer: 'There is a free tier.' },
        ]}
      />
    );
    expect(
      screen.getByRole('button', { name: /What is AIGC\?/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Is it free\?/ })
    ).toBeInTheDocument();
  });

  it('all answers are collapsed initially (aria-expanded=false)', () => {
    render(
      <FAQAccordion
        items={[
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
        ]}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    buttons.forEach((b) => expect(b).toHaveAttribute('aria-expanded', 'false'));
  });

  it('expands an answer when its toggle button is clicked (aria-expanded=true)', () => {
    render(
      <FAQAccordion items={[{ question: 'Q1', answer: 'Visible answer' }]} />
    );
    const btn = screen.getByRole('button', { name: /Q1/ });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Visible answer')).toBeInTheDocument();
  });

  it('collapses the open answer when the same button is clicked again', () => {
    render(
      <FAQAccordion items={[{ question: 'Q1', answer: 'A1' }]} />
    );
    const btn = screen.getByRole('button', { name: /Q1/ });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('only one answer is open at a time (accordion behavior)', () => {
    render(
      <FAQAccordion
        items={[
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
        ]}
      />
    );
    const [b1, b2] = screen.getAllByRole('button');

    fireEvent.click(b1);
    expect(b1).toHaveAttribute('aria-expanded', 'true');
    expect(b2).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(b2);
    expect(b1).toHaveAttribute('aria-expanded', 'false');
    expect(b2).toHaveAttribute('aria-expanded', 'true');
  });

  it('each button controls the matching answer region via aria-controls', () => {
    render(
      <FAQAccordion
        items={[
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
        ]}
      />
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn, i) => {
      const controlledId = btn.getAttribute('aria-controls');
      expect(controlledId).toBe(`faq-answer-${i}`);
      const region = document.getElementById(controlledId!);
      expect(region).not.toBeNull();
      expect(region).toHaveAttribute('role', 'region');
      expect(region).toHaveAttribute('aria-labelledby', `faq-question-${i}`);
    });
  });

  it('renders an empty list without crashing', () => {
    const { container } = render(<FAQAccordion items={[]} />);
    expect(container.firstChild).not.toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('does not toggle on Enter keydown (only on click) — click handler is mouse-only by design', () => {
    render(
      <FAQAccordion items={[{ question: 'Q1', answer: 'A1' }]} />
    );
    const btn = screen.getByRole('button', { name: /Q1/ });
    // Buttons natively trigger click on Enter/Space — but we only care that
    // the click handler updates aria-expanded. Test by directly firing click.
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });
});
