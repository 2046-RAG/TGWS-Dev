import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TcoCalculatorSection from './TcoCalculatorSection';

const fetchMock = vi.fn();

vi.mock('@/components/ui/TcoCalculatorClient', () => ({
  default: ({ config }: { config: { scenarios: unknown[] } }) => (
    <div data-testid="client">{config.scenarios.length} scenarios</div>
  ),
}));

describe('TcoCalculatorSection', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows loading spinner initially', () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    const { container } = render(<TcoCalculatorSection locale="en" />);
    expect(container.querySelector('[class*="animate-spin"]')).toBeTruthy();
  });

  it('renders client when config loads', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { scenarios: [{ id: 's1' }, { id: 's2' }] } }),
    });
    render(<TcoCalculatorSection locale="en" />);
    await waitFor(() => {
      expect(screen.getByTestId('client')).toHaveTextContent('2 scenarios');
    });
  });

  it('shows error state when config empty', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true, data: { scenarios: [] } }) });
    render(<TcoCalculatorSection locale="en" />);
    await waitFor(() => {
      expect(screen.getByText('TCO calculator temporarily unavailable')).toBeInTheDocument();
    });
  });

  it('shows error state on fetch failure', async () => {
    fetchMock.mockRejectedValue(new Error('network'));
    render(<TcoCalculatorSection locale="zh" />);
    await waitFor(() => {
      expect(screen.getByText('TCO 计算器暂时不可用')).toBeInTheDocument();
    });
  });
});
