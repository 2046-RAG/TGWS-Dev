import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterForm from './RegisterForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const m: Record<string, string> = {
      fullName: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      createAccount: 'Create Account',
      creatingAccount: 'Creating account...',
      passwordMismatch: 'Passwords do not match',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordRequirements: 'Password must contain uppercase, lowercase, and numbers',
    };
    return m[key] || key;
  },
}));

const mockSignUp = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signUp: mockSignUp },
  }),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockResolvedValue({ error: null });
  });

  it('renders all 4 form fields', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(document.getElementById('register-password')).toBeInTheDocument();
    expect(document.getElementById('register-confirm')).toBeInTheDocument();
  });

  it('renders create account button', () => {
    render(<RegisterForm />);
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(document.getElementById('register-password')!, { target: { value: 'Abcdef1@' } });
    fireEvent.change(document.getElementById('register-confirm')!, { target: { value: 'Wrong123@' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows error for password shorter than 8 characters', async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(document.getElementById('register-password')!, { target: { value: '123' } });
    fireEvent.change(document.getElementById('register-confirm')!, { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('shows error when password lacks uppercase, lowercase, or number', async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(document.getElementById('register-password')!, { target: { value: 'password' } });
    fireEvent.change(document.getElementById('register-confirm')!, { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/uppercase, lowercase/)).toBeInTheDocument();
    });
  });

  it('calls signUp with correct data on valid submission', async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(document.getElementById('register-password')!, { target: { value: 'Abcdef1@' } });
    fireEvent.change(document.getElementById('register-confirm')!, { target: { value: 'Abcdef1@' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'Abcdef1@',
        options: {
          data: { full_name: 'Test User' },
          emailRedirectTo: expect.stringContaining('/api/auth/callback'),
        },
      });
    });
  });

  it('displays error on signUp failure', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } });
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(document.getElementById('register-password')!, { target: { value: 'Abcdef1@' } });
    fireEvent.change(document.getElementById('register-confirm')!, { target: { value: 'Abcdef1@' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText('User already registered')).toBeInTheDocument();
    });
  });

  it('shows loading state during registration', async () => {
    let resolvePromise: (value: unknown) => void;
    mockSignUp.mockImplementation(() => new Promise(r => { resolvePromise = r; }));

    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(document.getElementById('register-password')!, { target: { value: 'Abcdef1@' } });
    fireEvent.change(document.getElementById('register-confirm')!, { target: { value: 'Abcdef1@' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Creating account...')).toBeInTheDocument();
    });

    await act(async () => {
      resolvePromise!({ error: null });
    });
  });

  it('accepts valid password with uppercase, lowercase, and number', async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(document.getElementById('register-password')!, { target: { value: 'Abcdef1@' } });
    fireEvent.change(document.getElementById('register-confirm')!, { target: { value: 'Abcdef1@' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
    // No password error should be shown
    expect(screen.queryByText(/Passwords do not match/)).not.toBeInTheDocument();
    expect(screen.queryByText(/at least 8 characters/)).not.toBeInTheDocument();
    expect(screen.queryByText(/uppercase, lowercase/)).not.toBeInTheDocument();
  });
});
