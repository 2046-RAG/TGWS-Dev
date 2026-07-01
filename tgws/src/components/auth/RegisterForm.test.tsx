import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterForm from './RegisterForm';

const mockPush = vi.fn();
const mockSignUp = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      fullName: 'Full Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      createAccount: 'Create Account',
      creatingAccount: 'Creating Account...',
      passwordMismatch: 'Passwords do not match',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordRequirements: 'Password must contain uppercase, lowercase, and number',
      fullNamePlaceholder: 'John Doe',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: 'Enter your password',
      confirmPasswordPlaceholder: 'Confirm your password',
    };
    return translations[key] ?? key;
  },
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RegisterForm', () => {
  it('renders all 4 form fields', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('renders create account button', () => {
    render(<RegisterForm />);
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Different1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows error for password shorter than 8 characters', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Ab1' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Ab1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows error when password lacks uppercase, lowercase, or number', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'lowercase' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'lowercase' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Password must contain uppercase, lowercase, and number')).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows error when password is all numbers', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Password must contain uppercase, lowercase, and number')).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('calls signUp with correct data on valid submission', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Secure123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Secure123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'Secure123',
        options: {
          data: { full_name: 'Jane Doe' },
        },
      });
    });
  });

  it('navigates to /support on successful registration', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Pass1234' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/support');
    });
  });

  it('displays error on signUp failure', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Pass1234' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('User already registered')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows loading state during registration', async () => {
    let resolveSignUp: (v: unknown) => void;
    mockSignUp.mockImplementation(() => new Promise((r) => { resolveSignUp = r; }));

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Pass1234' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Creating Account...' })).toBeDisabled();
    });

    resolveSignUp!({ error: null });
  });

  it('accepts valid password with uppercase, lowercase, and number', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Abcdef12' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Abcdef12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });

    // No validation error should be shown
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
