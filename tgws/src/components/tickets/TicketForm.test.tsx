import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
      occurredAt: 'Problem Time',
      screenshots: 'Screenshots',
      pasteScreenshot: 'Paste screenshot here',
      orClickToUpload: 'or click to upload',
      otherSpecify: 'Other',
      maxFileSize: 'Max 50MB',
      ticketNumber: 'Ticket',
    };
    return m[key] || key;
  },
}));

vi.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({ clear: vi.fn() }),
}));

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('TicketForm', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    // Default: /api/products returns empty list
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) });
  });

  it('renders all form fields', async () => {
    render(<TicketForm />);

    expect(screen.getByLabelText('Category *')).toBeInTheDocument();
    expect(screen.getByLabelText('Product *')).toBeInTheDocument();
    expect(screen.getByLabelText('Problem Time *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    expect(screen.getByLabelText('Attachments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('renders paste screenshot area', async () => {
    render(<TicketForm />);

    expect(screen.getByText('Paste screenshot here')).toBeInTheDocument();
    expect(screen.getByText('or click to upload')).toBeInTheDocument();
  });

  it('shows 800 char limit on description', async () => {
    render(<TicketForm />);

    const counter = screen.getByText('0/800');
    expect(counter).toBeInTheDocument();
  });

  it('category select has 3 options plus placeholder', async () => {
    render(<TicketForm />);

    const select = screen.getByLabelText('Category *');
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('Select');
    expect(options[1]).toHaveTextContent('Build');
    expect(options[2]).toHaveTextContent('Run');
    expect(options[3]).toHaveTextContent('Protect');
  });

  it('submit calls fetch with correct data including occurredAt', async () => {
    // Mock /api/tickets POST response
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true, data: { id: 'test-ticket-id' } }) });

    render(<TicketForm />);

    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'build' } });
    fireEvent.change(screen.getByLabelText('Product *'), { target: { value: '__other__' } });
    fireEvent.change(screen.getByLabelText('Subject *'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      // First call is /api/products, second is /api/tickets
      expect(fetchMock).toHaveBeenCalledWith('/api/tickets', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });

  it('shows success state after successful submission', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true, data: { id: 'test-ticket-id' } }) });

    render(<TicketForm />);

    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'build' } });
    fireEvent.change(screen.getByLabelText('Product *'), { target: { value: 'Other Product' } });
    fireEvent.change(screen.getByLabelText('Subject *'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Desc')).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    let resolveFetch: (value: { ok: boolean; json: () => Promise<unknown> }) => void;
    fetchMock.mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    );

    render(<TicketForm />);

    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'build' } });
    fireEvent.change(screen.getByLabelText('Product *'), { target: { value: 'Other Product' } });
    fireEvent.change(screen.getByLabelText('Subject *'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    resolveFetch!({ ok: true, json: () => Promise.resolve({ success: true, data: { id: 'test-id' } }) });

    await waitFor(() => {
      expect(screen.queryByText('Submitting...')).not.toBeInTheDocument();
    });
  });

  it('shows Other input when product is __other__', async () => {
    render(<TicketForm />);

    fireEvent.change(screen.getByLabelText('Product *'), { target: { value: '__other__' } });

    expect(screen.getByPlaceholderText('Please specify the product or service')).toBeInTheDocument();
  });
});
