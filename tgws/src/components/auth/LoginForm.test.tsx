import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';

const mockPush = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockSignInWithOAuth = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      forgotPassword: 'Forgot password?',
      backToLogin: 'Back to login',
      sendResetLink: 'Send Reset Link',
      sending: 'Sending...',
      signInWithGoogle: 'Sign in with Google',
      or: 'or',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: 'Enter your password',
      resetEmailSent: 'Reset email sent',
    };
    return translations[key] ?? key;
  },
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      resetPasswordForEmail: mockResetPasswordForEmail,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders Google sign in button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /Sign in with Google/ })).toBeInTheDocument();
  });

  it('calls signInWithPassword on form submit', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('navigates to /support on successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/support');
    });
  });

  it('displays error on auth failure', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('toggles to forgot password mode', async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to login' })).toBeInTheDocument();
  });

  it('toggles back to login mode from forgot password', () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to login' }));
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('calls resetPasswordForEmail in reset mode', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/api/auth/reset-password'),
      });
    });
  });

  it('shows loading state during sign in', async () => {
    let resolveAuth: (v: unknown) => void;
    mockSignInWithPassword.mockImplementation(() => new Promise((r) => { resolveAuth = r; }));

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    });

    resolveAuth!({ error: null });
  });

  it('calls signInWithOAuth when Google button is clicked', async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /Sign in with Google/ }));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: expect.stringContaining('/api/auth/callback') },
      });
    });
  });
});
