import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import GlobalSearch from './index';

vi.mock('next-intl', () => {
  const m: Record<string, string> = {
    searchPlaceholder: 'Search TechGuru...', searchButton: 'Search', close: 'Close',
    filters: 'Filters', noResults: 'No results found', leadTitle: 'Tell us more',
    imageHint: 'Paste or drop an image', uploading: 'Analyzing image...',
  };
  const t = (key: string) => m[key] ?? key;
  return { useLocale: () => 'en', useTranslations: () => t };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/sanity', () => ({
  client: { fetch: vi.fn() },
}));

vi.mock('@/lib/errors', () => ({
  logServiceError: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock('./SearchFiltersPanel', () => ({
  default: () => <div data-testid="filters-panel" />,
}));

vi.mock('./SearchResults', () => ({
  default: ({ results }: { results: unknown }) => (
    <div data-testid="results">
      {(results as { internalResults?: { title: string }[] })?.internalResults?.map(r => (
        <div key={r.title}>{r.title}</div>
      ))}
    </div>
  ),
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

function mockSearchResponse() {
  return {
    ok: true,
    json: () => Promise.resolve({
      success: true,
      data: {
        aiSummary: '[RESOURCES]\n2 resources\n\n[INSIGHT]\nInsight\n\n[SOURCES]\n- X (oracle.com)',
        internalResults: [{ id: 'p1', type: 'product', title: 'HCI Appliance', description: 'Desc', url: '/en/products/hci-appliance', source: 'internal', relevanceScore: 0.9 }],
        externalResults: [],
        capabilityGap: { detected: false, gapDescription: null },
        metadata: { externalSourcesAvailable: true },
      },
    }),
  };
}

describe('GlobalSearch', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<GlobalSearch isOpen={false} onClose={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('performs a search and renders internal results', async () => {
    fetchMock.mockResolvedValueOnce(mockSearchResponse());
    render(<GlobalSearch isOpen onClose={() => {}} />);

    const input = screen.getByPlaceholderText(/Search products, solutions/);
    fireEvent.change(input, { target: { value: 'hci' } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/search', expect.objectContaining({ method: 'POST' }));
    }, { timeout: 3000 });
    await waitFor(() => {
      expect(screen.getByText('HCI Appliance')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<GlobalSearch isOpen onClose={onClose} />);
    // backdrop click closes
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('handles image upload then searches with image data', async () => {
    fetchMock.mockResolvedValueOnce(mockSearchResponse());
    const { container } = render(<GlobalSearch isOpen onClose={() => {}} />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();
    const file = new File(['data'], 'pic.png', { type: 'image/png' });
    fireEvent.change(fileInput!, { target: { files: [file] } });
    // search button becomes enabled once an image is attached
    const searchBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(searchBtn);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('image'),
      }));
    }, { timeout: 3000 });
  });
});
