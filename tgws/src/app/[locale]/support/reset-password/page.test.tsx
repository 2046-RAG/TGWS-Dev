import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordPage from './page';

const { mockGetSession, mockUpdateUser, mockExchange } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockExchange: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: mockGetSession,
      exchangeCodeForSession: mockExchange,
      updateUser: mockUpdateUser,
    },
  }),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('next/navigation', () => ({ useParams: () => ({ locale: 'en' }) }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

describe('reset-password page (T-071)', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockUpdateUser.mockReset();
    mockExchange.mockReset();
    mockExchange.mockResolvedValue({ error: null });
  });

  it('shows an invalid-link message when there is no recovery session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    render(<ResetPasswordPage />);
    await waitFor(() => expect(screen.getByText('invalidResetLink')).toBeInTheDocument());
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('rejects mismatched passwords without calling updateUser', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
    render(<ResetPasswordPage />);
    await waitFor(() => expect(screen.getByText('updatePassword')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('newPassword'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('confirmNewPassword'), { target: { value: 'different1' } });
    fireEvent.click(screen.getByText('updatePassword'));

    await waitFor(() => expect(screen.getByText('passwordMismatch')).toBeInTheDocument());
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('updates the password and shows confirmation on success', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
    mockUpdateUser.mockResolvedValue({ error: null });
    render(<ResetPasswordPage />);
    await waitFor(() => expect(screen.getByText('updatePassword')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('newPassword'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('confirmNewPassword'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('updatePassword'));

    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'password123' }));
    await waitFor(() => expect(screen.getByText('passwordUpdated')).toBeInTheDocument());
  });
});
