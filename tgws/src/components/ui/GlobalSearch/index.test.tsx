import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import GlobalSearch from './index';

const { mockPush, mockTrackEvent } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockTrackEvent: vi.fn(),
}));
let latestProps: Record<string, unknown> = {};

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
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/lib/sanity', () => ({
  client: { fetch: vi.fn().mockResolvedValue(null) },
}));

vi.mock('@/lib/errors', () => ({
  logServiceError: vi.fn(),
  trackEvent: mockTrackEvent,
}));

vi.mock('./SearchFiltersPanel', () => ({
  default: (props: Record<string, unknown>) => {
    latestProps = { ...latestProps, ...props };
    return <div data-testid="filters-panel" />;
  },
}));

vi.mock('./SearchResults', () => ({
  default: (props: Record<string, unknown>) => {
    latestProps = { ...latestProps, ...props };
    const results = props.results as { internalResults?: { title: string; url: string }[]; capabilityGap?: { detected: boolean } } | null;
    return (
      <div data-testid="results">
        {results?.internalResults?.map(r => (
          <button key={r.title} onClick={() => (props.onResultClick as (u: string) => void)(r.url)}>
            {r.title}
          </button>
        ))}
        {results?.capabilityGap?.detected ? <div data-testid="gap-detected" /> : null}
      </div>
    );
  },
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
        capabilityGap: { detected: true, gapDescription: 'No resources for this' },
        metadata: { externalSourcesAvailable: true },
      },
    }),
  };
}

describe('GlobalSearch', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockPush.mockClear();
    mockTrackEvent.mockClear();
    latestProps = {};
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

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<GlobalSearch isOpen onClose={onClose} />);
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates and closes on result click', async () => {
    fetchMock.mockResolvedValueOnce(mockSearchResponse());
    const onClose = vi.fn();
    render(<GlobalSearch isOpen onClose={onClose} />);
    fireEvent.change(screen.getByPlaceholderText(/Search products, solutions/), { target: { value: 'hci' } });
    await waitFor(() => expect(screen.getByText('HCI Appliance')).toBeInTheDocument(), { timeout: 3000 });
    fireEvent.click(screen.getByText('HCI Appliance'));
    expect(mockPush).toHaveBeenCalledWith('/en/products/hci-appliance');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders capability gap indicator when detected', async () => {
    fetchMock.mockResolvedValueOnce(mockSearchResponse());
    render(<GlobalSearch isOpen onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/Search products, solutions/), { target: { value: 'hci' } });
    await waitFor(() => expect(screen.getByTestId('gap-detected')).toBeInTheDocument(), { timeout: 3000 });
  });

  it('submits a lead via the lead form', async () => {
    fetchMock
      .mockResolvedValueOnce(mockSearchResponse()) // search
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) }); // lead
    render(<GlobalSearch isOpen onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/Search products, solutions/), { target: { value: 'hci' } });
    await waitFor(() => expect(screen.getByText('HCI Appliance')).toBeInTheDocument(), { timeout: 3000 });
    // trigger lead submit through captured props
    const leadSubmit = latestProps.onLeadSubmit as (d: Record<string, string>) => Promise<void>;
    await act(async () => {
      await leadSubmit({ name: 'Jane', email: 'j@x.com' });
    });
    expect(mockTrackEvent).toHaveBeenCalledWith('lead_submitted', expect.anything());
    expect(fetchMock).toHaveBeenCalledWith('/api/search/lead', expect.objectContaining({ method: 'POST' }));
  });
});
