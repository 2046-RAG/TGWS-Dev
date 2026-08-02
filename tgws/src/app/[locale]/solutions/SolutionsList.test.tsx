import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SolutionsList from './SolutionsList';

vi.mock('next-intl', () => {
  const industries: Record<string, { name: string; description: string }> = {
    healthcare: { name: 'Healthcare', description: 'Patient care solutions' },
    finance: { name: 'Finance', description: 'Banking and fintech' },
    retail: { name: 'Retail', description: 'Commerce solutions' },
    logistics: { name: 'Logistics', description: 'Supply chain' },
    education: { name: 'Education', description: 'Learning platforms' },
    government: { name: 'Government', description: 'Public sector' },
  };
  const m: Record<string, string> = { searchPlaceholder: 'Search industries' };
  const t = (key: string) => {
    if (key.startsWith('industries.')) {
      const parts = key.split('.');
      const meta = industries[parts[1]];
      if (meta && parts[2]) return meta[parts[2] as keyof typeof meta] || key;
      return meta?.name || key;
    }
    return m[key] ?? key;
  };
  (t as unknown as Record<string, unknown>).raw = (key: string) => {
    if (key.includes('painPoints')) return ['Pain point 1', 'Pain point 2'];
    return undefined;
  };
  return { useTranslations: () => t };
});

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

const solutions = [
  { _id: '1', title: 'Healthcare Cloud', slug: 'healthcare-cloud', industry: 'healthcare', challenges: ['Legacy systems'], recommendedProducts: ['VMware'] },
  { _id: '2', title: 'Banking Security', slug: 'banking-security', industry: 'finance', challenges: ['Compliance'], recommendedProducts: ['Firewall'] },
];

describe('SolutionsList', () => {
  it('renders all industry tabs', () => {
    render(<SolutionsList solutions={solutions as never} />);
    expect(screen.getAllByText('Healthcare').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Finance').length).toBeGreaterThan(0);
    expect(screen.getByText('Retail')).toBeInTheDocument();
  });

  it('filters industries by search query', () => {
    render(<SolutionsList solutions={solutions as never} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'health' } });
    // Only Healthcare remains as a selectable industry tab
    expect(screen.getAllByText('Healthcare').length).toBeGreaterThan(0);
    const tabs = screen.getAllByRole('button');
    const tabTexts = tabs.map(b => b.textContent || '');
    expect(tabTexts.some(t => t.includes('Retail'))).toBe(false);
    expect(tabTexts.some(t => t.includes('Finance'))).toBe(false);
  });

  it('clears search with the X button', () => {
    render(<SolutionsList solutions={solutions as never} />);
    fireEvent.change(screen.getByPlaceholderText('Search industries'), { target: { value: 'health' } });
    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });
});
