import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProfilePage from './page';

const mockGetUser = vi.fn();
const mockUpdateUser = vi.fn();
const mockPush = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
    },
  }),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('@/components/ui/Breadcrumb', () => ({ default: () => <nav data-testid="breadcrumb" /> }));

function authedUser(over: Record<string, unknown> = {}) {
  return {
    data: {
      user: { id: 'u1', email: 'u@x.com', user_metadata: { display_name: 'Alice' }, ...over },
    },
  };
}

describe('ProfilePage', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockUpdateUser.mockReset();
    mockPush.mockClear();
    mockUpdateUser.mockResolvedValue({ error: null });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading spinner while fetching user', () => {
    mockGetUser.mockReturnValue(new Promise(() => {}));
    const { container } = render(<ProfilePage />);
    expect(container.querySelector('[class*="animate-spin"]')).toBeTruthy();
  });

  it('redirects to login when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<ProfilePage />);
    await act(async () => { await Promise.resolve(); });
    expect(mockPush).toHaveBeenCalledWith('/en/support/login');
  });

  it('renders profile form with user data', async () => {
    mockGetUser.mockResolvedValue(authedUser());
    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('u@x.com')).toBeInTheDocument();
      expect((screen.getByPlaceholderText('Enter your name') as HTMLInputElement).value).toBe('Alice');
    });
  });

  it('updates display name on save', async () => {
    mockGetUser.mockResolvedValue(authedUser());
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ data: { display_name: 'Bob' } });
    });
    expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
  });

  it('rejects mismatched passwords', async () => {
    mockGetUser.mockResolvedValue(authedUser());
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByPlaceholderText('New password (min 8 chars)')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('New password (min 8 chars)'), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    expect(mockUpdateUser).not.toHaveBeenCalledWith({ password: 'secret123' });
  });

  it('rejects passwords shorter than 8 characters', async () => {
    mockGetUser.mockResolvedValue(authedUser());
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByPlaceholderText('New password (min 8 chars)')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('New password (min 8 chars)'), { target: { value: 'short' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'short' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('shows update error when profile save fails', async () => {
    mockGetUser.mockResolvedValue(authedUser());
    mockUpdateUser.mockResolvedValueOnce({ error: { message: 'update failed' } });
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(screen.getByText('update failed')).toBeInTheDocument();
    });
  });
});
