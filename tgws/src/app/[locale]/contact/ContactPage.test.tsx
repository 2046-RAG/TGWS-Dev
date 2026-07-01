import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ContactPage from './page';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Contact Us',
      subtitle: 'Get in touch',
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      company: 'Company',
      companyPlaceholder: 'Company',
      phone: 'Phone',
      phonePlaceholder: 'Phone',
      message: 'Message',
      messagePlaceholder: 'Your message',
      submit: 'Send',
      sending: 'Sending...',
      success: 'Sent!',
      error: 'Something went wrong',
      required: 'Required',
      invalidEmail: 'Invalid email',
      offices: 'Our Offices',
      taipei: 'Taipei',
      taipeiAddr: 'Address',
      hongKong: 'Hong Kong',
      hongKongAddr: 'Address',
      social: 'Contact Info',
      skipToForm: 'Skip to form',
    };
    return translations[key] ?? key;
  },
}));

// Helper: find input by its associated label text (labels include " * " suffix)
function getInputByLabel(labelText: string) {
  const label = screen.getByText((content, element) => {
    return element?.tagName === 'LABEL' && content.startsWith(labelText);
  });
  const id = label.getAttribute('for');
  return document.getElementById(id!) as HTMLInputElement | HTMLTextAreaElement;
}

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('ContactPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockFetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all form fields', () => {
    render(<ContactPage />);

    expect(getInputByLabel('Name')).toBeInTheDocument();
    expect(getInputByLabel('Email')).toBeInTheDocument();
    expect(getInputByLabel('Company')).toBeInTheDocument();
    expect(getInputByLabel('Phone')).toBeInTheDocument();
    expect(getInputByLabel('Message')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<ContactPage />);
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
  });

  it('renders offices section', () => {
    render(<ContactPage />);
    expect(screen.getByText('Our Offices')).toBeInTheDocument();
    expect(screen.getByText('Taipei')).toBeInTheDocument();
    expect(screen.getByText('Hong Kong')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<ContactPage />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    });

    const requiredErrors = screen.getAllByText('Required');
    expect(requiredErrors.length).toBeGreaterThanOrEqual(3); // name, email, message
  });

  it('shows email error for invalid email format', async () => {
    render(<ContactPage />);

    await act(async () => {
      fireEvent.change(getInputByLabel('Name'), { target: { value: 'John' } });
      fireEvent.change(getInputByLabel('Email'), { target: { value: 'not-an-email' } });
      fireEvent.change(getInputByLabel('Message'), { target: { value: 'Hello' } });
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    });

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('sets aria-required and aria-invalid attributes', () => {
    render(<ContactPage />);

    const nameInput = getInputByLabel('Name');
    expect(nameInput).toHaveAttribute('aria-required', 'true');

    const emailInput = getInputByLabel('Email');
    expect(emailInput).toHaveAttribute('aria-required', 'true');

    const messageInput = getInputByLabel('Message');
    expect(messageInput).toHaveAttribute('aria-required', 'true');

    expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('submits form successfully and shows success state', async () => {
    render(<ContactPage />);

    await act(async () => {
      fireEvent.change(getInputByLabel('Name'), { target: { value: 'Jane' } });
      fireEvent.change(getInputByLabel('Email'), { target: { value: 'jane@example.com' } });
      fireEvent.change(getInputByLabel('Message'), { target: { value: 'Test message' } });
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    });

    // Wait for fetch to resolve
    await act(async () => {
      await mockFetch.mock.results[0].value;
    });

    expect(screen.getByText('Sent!')).toBeInTheDocument();
  });

  it('resets form fields after successful submission', async () => {
    render(<ContactPage />);

    await act(async () => {
      fireEvent.change(getInputByLabel('Name'), { target: { value: 'Jane' } });
      fireEvent.change(getInputByLabel('Email'), { target: { value: 'jane@example.com' } });
      fireEvent.change(getInputByLabel('Message'), { target: { value: 'Test' } });
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    });

    await act(async () => {
      await mockFetch.mock.results[0].value;
    });

    expect(getInputByLabel('Name')).toHaveValue('');
    expect(getInputByLabel('Email')).toHaveValue('');
    expect(getInputByLabel('Message')).toHaveValue('');
  });

  it('shows sending state while submitting', async () => {
    render(<ContactPage />);

    await act(async () => {
      fireEvent.change(getInputByLabel('Name'), { target: { value: 'Jane' } });
      fireEvent.change(getInputByLabel('Email'), { target: { value: 'jane@example.com' } });
      fireEvent.change(getInputByLabel('Message'), { target: { value: 'Test' } });
    });

    // Make fetch hang so we can see "Sending..."
    mockFetch.mockReturnValue(new Promise(() => {}));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    });

    // Immediately after click, button should show "Sending..."
    expect(screen.getByRole('button', { name: /Sending/i })).toBeDisabled();
  });
});
