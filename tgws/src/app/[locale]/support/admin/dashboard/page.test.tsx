import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import AdminDashboardPage from './page';

const mockGetUser = vi.fn();
const mockPush = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock('next-intl', () => {
  const m: Record<string, string> = {
    title: 'Dashboard', totalTickets: 'Total', openTickets: 'Open', inProgress: 'In Progress',
    resolvedTickets: 'Resolved', critical: 'Critical', avgAge: 'Avg age',
  };
  const t = (key: string) => m[key] ?? key;
  return { useTranslations: () => t };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('@/components/ui/Breadcrumb', () => ({ default: () => <nav data-testid="breadcrumb" /> }));

const statsPayload = {
  success: true,
  data: {
    total: 10,
    byStatus: { open: 4, in_progress: 3, resolved: 2, closed: 1 },
    byCategory: { build: 5, run: 3, protect: 2 },
    byPriority: { critical: 1, high: 3, medium: 4, low: 2 },
    avgAgeDays: 3,
    recent: [{ id: 't1', ticket_number: 'TK-1', subject: 'VM issue', status: 'open' }],
  },
};

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockPush.mockClear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(statsPayload) }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    mockGetUser.mockReturnValue(new Promise(() => {}));
    const { container } = render(<AdminDashboardPage />);
    expect(container.querySelector('[class*="animate-spin"]')).toBeTruthy();
  });

  it('redirects to login when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<AdminDashboardPage />);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(mockPush).toHaveBeenCalledWith('/en/support/login');
  });

  it('renders stats cards for authenticated admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'a1', email: 'a@x.com' } } });
    render(<AdminDashboardPage />);
    await waitFor(() => {
      // recent ticket subject renders
      expect(screen.getByText('VM issue')).toBeInTheDocument();
      // total 10 appears somewhere
      expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    });
  });

  it('handles fetch failure gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    mockGetUser.mockResolvedValue({ data: { user: { id: 'a1' } } });
    const { container } = render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(container.querySelector('[class*="animate-spin"]')).toBeFalsy();
    });
  });
});
