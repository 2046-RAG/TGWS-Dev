import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UserMenu from './UserMenu';

const mockGetUser = vi.fn();
const mockSignOut = vi.fn();
const mockPush = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: mockSignOut,
    },
  }),
}));

vi.mock('next-intl', () => ({ useLocale: () => 'en' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('UserMenu', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockSignOut.mockReset();
    mockPush.mockClear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the menu trigger with headphone icon when logged out', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<UserMenu />);
    await act(async () => { await Promise.resolve(); });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows sign-in and create-account actions for guests', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<UserMenu />);
    await act(async () => { await Promise.resolve(); });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('shows profile, support and sign-out for authenticated users', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u@x.com' } } });
    render(<UserMenu />);
    await act(async () => { await Promise.resolve(); });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('u@x.com')).toBeInTheDocument();
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Support Center')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('navigates to profile when clicked', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u@x.com' } } });
    render(<UserMenu />);
    await act(async () => { await Promise.resolve(); });
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('My Profile'));
    expect(mockPush).toHaveBeenCalledWith('/en/profile');
  });

  it('signs out and navigates home', async () => {
    mockSignOut.mockResolvedValue(undefined);
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u@x.com' } } });
    render(<UserMenu />);
    await act(async () => { await Promise.resolve(); });
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Sign Out'));
    await act(async () => { await Promise.resolve(); });
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/en');
  });
});
