import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ locale: 'en' }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const m: Record<string, string> = {
      email: 'Email Address',
      emailPlaceholder: 'you@company.com',
      password: 'Password',
      passwordPlaceholder: 'Min 8 chars',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      signInWithGoogle: 'Sign in with Google',
      or: 'or',
      forgotPassword: 'Forgot password?',
      resetPassword: 'Reset Password',
      resetEmailSent: 'Password reset email sent.',
      backToLogin: 'Back to Sign In',
      sendResetLink: 'Send Reset Link',
      sending: 'Sending...',
    };
    return m[key] || key;
  },
}));

// Mock Supabase client
const mockSignInWithPassword = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockResetPasswordForEmail = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
  });

  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders Google sign in button', () => {
    render(<LoginForm />);
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
  });

  it('calls signInWithPassword on form submit', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In',  }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('calls signInWithOAuth when Google button is clicked', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText(/Sign in with Google/i));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalled();
    });
  });

  it('toggles to forgot password mode', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText(/Forgot password/i));
    expect(screen.getByText(/Send Reset Link/i)).toBeVisible();
  });

  it('toggles back to login mode from forgot password', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText(/Forgot password/i));
    fireEvent.click(screen.getByText(/Back to Sign In/i));
    expect(screen.getByRole('button', { name: 'Sign In',  })).toBeVisible();
  });

  it('calls resetPasswordForEmail in reset mode', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText(/Forgot password/i));
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link',  }));

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalled();
    });
  });

  it('displays error on auth failure', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In',  }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows loading state during sign in', async () => {
    let resolve: (v: unknown) => void;
    mockSignInWithPassword.mockImplementation(() => new Promise(r => { resolve = r; }));

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In',  }));

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });

    resolve!({ error: null });
  });
});
