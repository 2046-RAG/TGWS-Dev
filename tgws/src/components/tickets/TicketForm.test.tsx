import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TicketForm from './TicketForm';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const m: Record<string, string> = {
      category: 'Category',
      selectCategory: 'Select',
      build: 'Build',
      run: 'Run',
      protect: 'Protect',
      productService: 'Product',
      subject: 'Subject',
      description: 'Description',
      attachments: 'Attachments',
      submitTicket: 'Submit',
      submitting: 'Submitting...',
      ticketSubmitted: 'Submitted',
      ticketSubmittedDesc: 'Desc',
    };
    return m[key] || key;
  },
}));

vi.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({ clear: vi.fn() }),
}));

describe('TicketForm', () => {
  it('renders all form fields', () => {
    render(<TicketForm />);
    
    expect(screen.getByLabelText('Category *')).toBeInTheDocument();
    expect(screen.getByLabelText('Product *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    expect(screen.getByLabelText('Attachments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('category select has 3 options plus placeholder', () => {
    render(<TicketForm />);
    
    const select = screen.getByLabelText('Category *');
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('Select');
    expect(options[1]).toHaveTextContent('Build');
    expect(options[2]).toHaveTextContent('Run');
    expect(options[3]).toHaveTextContent('Protect');
  });

  it('submit calls fetch with correct data', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    render(<TicketForm />);

    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'build' } });
    fireEvent.change(screen.getByLabelText('Product *'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText('Subject *'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'build',
          productService: 'Test Product',
          subject: 'Test Subject',
          description: 'Test Description',
        }),
      });
    });
  });

  it('shows success state after successful submission', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<TicketForm />);

    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'build' } });
    fireEvent.change(screen.getByLabelText('Product *'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText('Subject *'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Desc')).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    let resolveFetch: (value: { ok: boolean }) => void;
    global.fetch = vi.fn().mockImplementation(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    );

    render(<TicketForm />);

    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'build' } });
    fireEvent.change(screen.getByLabelText('Product *'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText('Subject *'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    resolveFetch!({ ok: true });

    await waitFor(() => {
      expect(screen.queryByText('Submitting...')).not.toBeInTheDocument();
    });
  });
});