import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TcoCalculatorClient from './TcoCalculatorClient';

vi.mock('@/lib/tco', () => ({
  calcScenario: () => ({
    results: [
      { vendor: 'vmware', bundleName: 'VVF', bundleNameZh: 'vSphere Foundation', totalCost: 28800, costPerYear: 9600, isEstimated: false, includedModules: ['vSphere', 'vSAN'] },
      { vendor: 'sangfor', bundleName: 'aSV', bundleNameZh: 'aSV 企業版', totalCost: 21460, costPerYear: 7153, isEstimated: true, includedModules: ['aSV', 'aNET'] },
      { vendor: 'nutanix', bundleName: 'NCI Pro', bundleNameZh: 'NCI 專業版', totalCost: 83136, costPerYear: 27712, isEstimated: false, includedModules: ['NCI', 'NCM'] },
    ],
  }),
  calcCumulative: () => [
    { year: 1, results: [{ vendor: 'vmware', cost: 9600 }, { vendor: 'sangfor', cost: 7153 }, { vendor: 'nutanix', cost: 27712 }] },
    { year: 2, results: [{ vendor: 'vmware', cost: 19200 }, { vendor: 'sangfor', cost: 14307 }, { vendor: 'nutanix', cost: 55424 }] },
    { year: 3, results: [{ vendor: 'vmware', cost: 28800 }, { vendor: 'sangfor', cost: 21460 }, { vendor: 'nutanix', cost: 83136 }] },
  ],
  fuzzPrice: (n: number) => Math.round(n / 500) * 500,
}));

const config = {
  scenarios: [
    { name: 'Server Virtualization', nameZh: '伺服器虛擬化', description: 'Standard', descriptionZh: '標準', order: 1 },
    { name: 'SDDC', nameZh: '軟體定義資料中心', description: 'Full stack', descriptionZh: '全棧', order: 2 },
    { name: 'Private Cloud', nameZh: '私有雲', description: 'Hybrid', descriptionZh: '混合', order: 3 },
  ],
  disclaimer: 'Estimates only',
  lastUpdated: '2026-07',
} as never;

describe('TcoCalculatorClient', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders scenario buttons and inputs', () => {
    render(<TcoCalculatorClient config={config} locale="en" />);
    expect(screen.getByText('Server Virtualization')).toBeInTheDocument();
    expect(screen.getByText('SDDC')).toBeInTheDocument();
    expect(screen.getByText('Private Cloud')).toBeInTheDocument();
    expect(screen.getByText('Cores Per CPU')).toBeInTheDocument();
    expect(screen.getByText('CPU Sockets')).toBeInTheDocument();
    expect(screen.getByText('Calculate TCO')).toBeInTheDocument();
  });

  it('shows placeholder before calculating', () => {
    render(<TcoCalculatorClient config={config} locale="en" />);
    expect(screen.getByText(/Select a scenario and calculate/)).toBeInTheDocument();
  });

  it('calculates and renders the results table', () => {
    render(<TcoCalculatorClient config={config} locale="en" />);
    fireEvent.click(screen.getByText('Calculate TCO'));
    expect(screen.getByText('3-Year TCO Comparison')).toBeInTheDocument();
    expect(screen.getByText('$28,800')).toBeInTheDocument();
    expect(screen.getByText('~$21,500')).toBeInTheDocument(); // fuzzed sangfor
    expect(screen.getByText('$83,136')).toBeInTheDocument();
    // chart renders
    expect(screen.getByRole('img', { name: 'TCO cumulative cost chart' })).toBeInTheDocument();
  });

  it('switches scenarios and resets computed state', () => {
    render(<TcoCalculatorClient config={config} locale="en" />);
    fireEvent.click(screen.getByText('SDDC'));
    fireEvent.click(screen.getByText('Calculate TCO'));
    expect(screen.getByText('3-Year TCO Comparison')).toBeInTheDocument();
    // switch resets
    fireEvent.click(screen.getByText('Private Cloud'));
    expect(screen.getByText(/Select a scenario and calculate/)).toBeInTheDocument();
  });

  it('adjusts cores and sockets via sliders', () => {
    render(<TcoCalculatorClient config={config} locale="en" />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '32' } });
    fireEvent.change(sliders[1], { target: { value: '8' } });
    expect(screen.getByText('256')).toBeInTheDocument(); // 32 * 8 total cores
  });

  it('changes year selection', () => {
    render(<TcoCalculatorClient config={config} locale="en" />);
    fireEvent.click(screen.getByText('5 yr'));
    fireEvent.click(screen.getByText('Calculate TCO'));
    expect(screen.getByText('5-Year TCO Comparison')).toBeInTheDocument();
  });

  it('exports PNG via canvas download', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const ctxMock = {
      fillStyle: '', font: '', fillRect: vi.fn(), fillText: vi.fn(), drawImage: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctxMock as never);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,x');
    // jsdom never fires Image.onload on its own — fire it after src is assigned
    const realImage = globalThis.Image;
    class FakeImage {
      onload: (() => void) | null = null;
      set src(_v: string) { queueMicrotask(() => this.onload?.()); }
    }
    vi.stubGlobal('Image', FakeImage);
    render(<TcoCalculatorClient config={config} locale="en" />);
    fireEvent.click(screen.getByText('Calculate TCO'));
    fireEvent.click(screen.getByText('Export PNG'));
    await vi.waitFor(() => expect(clickSpy).toHaveBeenCalled(), { timeout: 2000 });
    vi.unstubAllGlobals();
    void realImage;
  });
});
