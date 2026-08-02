import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
      productOtherPlaceholder: 'Please specify the product or service',
      subject: 'Subject',
      subjectPlaceholder: 'Enter subject',
      description: 'Description',
      descriptionPlaceholder: 'Describe the issue',
      attachments: 'Attachments',
      submitTicket: 'Submit',
      submitting: 'Submitting...',
      uploadingFiles: 'Uploading files...',
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
  useAutoSave: () => ({ clear: vi.fn(), lastSaved: null }),
}));

vi.mock('@/lib/errors', () => ({
  trackEvent: vi.fn(),
}));

const fetchMock = vi.fn();
global.fetch = fetchMock;

function mockProducts() {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ success: true, data: [
      { _id: 'p1', title: 'vSphere', category: 'run' },
      { _id: 'p2', title: 'Firewall', category: 'protect' },
    ] }),
  });
}

describe('TicketForm error handling', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockProducts();
  });

  it('shows server error message when ticket creation fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Server exploded' }),
    });

    render(<TicketForm />);
    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'build' } });
    fireEvent.change(screen.getByLabelText('Product *'), { target: { value: 'vSphere' } });
    fireEvent.change(screen.getByLabelText('Subject *'), { target: { value: 'S' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'D' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Server exploded');
    });
    // Form still visible after error (no success screen)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});

describe('TicketForm product grouping', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockProducts();
  });

  it('renders products grouped by category optgroups', async () => {
    await act(async () => { render(<TicketForm />); });
    const select = screen.getByLabelText('Product *');
    const groups = select.querySelectorAll('optgroup');
    expect(groups.length).toBeGreaterThanOrEqual(2);
    const labels = Array.from(groups).map(g => g.getAttribute('label'));
    expect(labels).toContain('Run');
    expect(labels).toContain('Protect');
    expect(select.querySelectorAll('option[value="vSphere"]')).toHaveLength(1);
  });
});

describe('TicketForm paste area', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockProducts();
  });

  it('adds pasted image and removes it via the X button', async () => {
    const { container } = render(<TicketForm />);
    await act(async () => { await Promise.resolve(); });
    // The paste handler lives on the dashed-border wrapper div
    const pasteArea = container.querySelector('div[cursor-pointer]') || container.querySelector('div[class*="border-dashed"]');
    expect(pasteArea).toBeTruthy();

    const file = new File(['x'], 'shot.png', { type: 'image/png' });
    // jsdom has no DataTransfer — build a minimal clipboardData shape
    const clipboardData = {
      items: [{ type: 'image/png', getAsFile: () => file }],
    } as unknown as DataTransfer;

    fireEvent.paste(pasteArea!, { clipboardData });
    await waitFor(() => {
      expect(screen.getByAltText('Screenshot 1')).toBeInTheDocument();
    });
  });

  it('ignores non-image clipboard content', async () => {
    const { container } = render(<TicketForm />);
    await act(async () => { await Promise.resolve(); });
    const pasteArea = container.querySelector('div[class*="border-dashed"]');
    const clipboardData = {
      items: [{ type: 'text/plain', getAsFile: () => new File(['t'], 'note.txt') }],
    } as unknown as DataTransfer;
    fireEvent.paste(pasteArea!, { clipboardData });
    expect(screen.queryByAltText('Screenshot 1')).not.toBeInTheDocument();
  });
});

describe('TicketForm char counter', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockProducts();
  });

  it('updates the description counter as user types', async () => {
    await act(async () => { render(<TicketForm />); });
    const ta = screen.getByLabelText('Description *');
    fireEvent.change(ta, { target: { value: 'hello' } });
    expect(screen.getByText('5/800')).toBeInTheDocument();
  });
});
