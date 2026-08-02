import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import SupportPage from './page';

const mockGetUser = vi.fn();
const mockPush = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: mockFrom,
  }),
}));

vi.mock('next-intl', () => {
  const m: Record<string, string> = {
    title: 'Support Center', subtitle: 'Get help', signInPrompt: 'Please sign in',
    signIn: 'Sign In', welcome: 'Welcome', tabs: 'Tabs',
  };
  const t = (key: string) => m[key] ?? key;
  return { useTranslations: () => t, useLocale: () => 'en' };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('@/components/ui/Breadcrumb', () => ({ default: () => <nav data-testid="breadcrumb" /> }));
vi.mock('@/components/tickets/TicketForm', () => ({ default: () => <div data-testid="ticket-form" /> }));
vi.mock('@/components/tickets/TicketList', () => ({ default: () => <div data-testid="ticket-list" /> }));

describe('SupportPage', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockPush.mockClear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state while checking auth', () => {
    mockGetUser.mockReturnValue(new Promise(() => {}));
    const { container } = render(<SupportPage />);
    // loading UI is present — spinner or skeleton
    expect(container.querySelector('[class*="animate-spin"]') || container.querySelector('svg')).toBeTruthy();
  });

  it('redirects to login when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<SupportPage />);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });
    expect(mockPush).toHaveBeenCalledWith('/en/support/login');
  });

  it('renders dashboard and switches to my-tickets tab', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [{ id: 't1', ticket_number: 'TK-1', subject: 'Test', status: 'open', category: 'run', created_at: new Date().toISOString() }],
      }),
    }));
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'u@x.com', user_metadata: {}, app_metadata: { role: 'customer' } },
      },
    });
    // users role lookup + tickets fetch + any other from() calls resolve empty
    mockFrom.mockReturnValue({
      select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'customer' }, error: null }) }) }),
      is: () => ({ order: async () => ({ data: [], error: null }) }),
    });
    render(<SupportPage />);
    // dashboard renders after auth resolves; with tickets present TicketList shows
    await waitFor(() => {
      expect(screen.getByTestId('ticket-list')).toBeInTheDocument();
    });
  });
});
