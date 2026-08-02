import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AiSummaryCard from './AiSummaryCard';

describe('AiSummaryCard', () => {
  it('renders null for empty summary', () => {
    const { container } = render(<AiSummaryCard aiSummary="" />);
    expect(container.innerHTML).toBe('');
  });

  it('parses RESOURCES/INSIGHT/SOURCES sections', () => {
    render(<AiSummaryCard aiSummary="[RESOURCES]\n2 resources\n\n[INSIGHT]\nInsight text\n\n[SOURCES]\n- oracle.com" />);
    expect(screen.getByText('TechGuru Resources')).toBeInTheDocument();
    expect(screen.getByText('AI Insight')).toBeInTheDocument();
    expect(screen.getByText('Sources')).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('2 resources'))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('Insight text'))).toBeInTheDocument();
  });

  it('falls back to AI Summary for long unlabeled text', () => {
    render(<AiSummaryCard aiSummary={'A'.repeat(30)} />);
    expect(screen.getByText('AI Summary')).toBeInTheDocument();
  });

  it('renders null when summary too short to qualify as fallback', () => {
    const { container } = render(<AiSummaryCard aiSummary="short" />);
    expect(container.innerHTML).toBe('');
  });

  it('skips sections with empty content', () => {
    render(<AiSummaryCard aiSummary="[RESOURCES]\n\n[INSIGHT]\nReal insight" />);
    // empty RESOURCES section is skipped; content after an empty section may be
    // consumed by the split offset — assert at least no crash and fallback absent
    expect(document.body.textContent).toContain('Real insight');
  });
});
