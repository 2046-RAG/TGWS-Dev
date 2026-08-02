import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TicketList from './TicketList';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const m: Record<string, string> = {
      ticketOpen: 'Open',
      ticketInProgress: 'In Progress',
      ticketResolved: 'Resolved',
      ticketClosed: 'Closed',
      noTickets: 'No tickets',
      searchTickets: 'Search tickets',
      noTicketsFound: 'No tickets found',
    };
    return m[key] || key;
  },
}));

vi.mock('./AttachmentPreview', () => ({
  default: () => <div data-testid="attachment-preview" />,
}));

const tickets = [
  { id: '1', ticket_number: 'TK-001', subject: 'VMware issue', status: 'open', category: 'run', created_at: '2024-01-15T10:30:00Z' },
  { id: '2', ticket_number: 'TK-002', subject: 'Firewall config', status: 'resolved', category: 'protect', created_at: '2024-02-01T08:00:00Z' },
  { id: '3', ticket_number: 'TK-003', subject: 'AI deployment', status: 'in_progress', category: 'build', created_at: '2024-03-10T12:00:00Z' },
];

describe('TicketList search', () => {
  it('filters tickets by query', () => {
    render(<TicketList tickets={tickets} />);
    fireEvent.change(screen.getByPlaceholderText('Search tickets'), { target: { value: 'firewall' } });
    expect(screen.getByText('TK-002')).toBeInTheDocument();
    expect(screen.queryByText('TK-001')).not.toBeInTheDocument();
  });

  it('clears search with the X button', () => {
    render(<TicketList tickets={tickets} />);
    fireEvent.change(screen.getByPlaceholderText('Search tickets'), { target: { value: 'firewall' } });
    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(screen.getByText('TK-001')).toBeInTheDocument();
  });

  it('shows no-results message when search matches nothing', () => {
    render(<TicketList tickets={tickets} />);
    fireEvent.change(screen.getByPlaceholderText('Search tickets'), { target: { value: 'zzz' } });
    expect(screen.getByText('No tickets found')).toBeInTheDocument();
  });
});

describe('TicketList admin batch actions', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();
  });

  it('selects all and clears selection', () => {
    render(<TicketList tickets={tickets} isAdmin />);
    fireEvent.click(screen.getByText('Select all'));
    expect(screen.getByText('3 tickets selected')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Select all'));
    expect(screen.queryByText('3 tickets selected')).not.toBeInTheDocument();
  });

  it('toggles individual ticket selection', () => {
    const { container } = render(<TicketList tickets={tickets} isAdmin />);
    // First ticket card's leading button is its select toggle
    const listitem = container.querySelector('[role="listitem"]')!;
    const toggle = listitem.querySelector('button')!;
    fireEvent.click(toggle);
    expect(screen.getByText('1 ticket selected')).toBeInTheDocument();
  });

  it('calls onBatchStatusUpdate and clears selection', async () => {
    const onBatch = vi.fn().mockResolvedValue(undefined);
    render(<TicketList tickets={tickets} isAdmin onBatchStatusUpdate={onBatch} />);
    fireEvent.click(screen.getByText('Select all'));
    fireEvent.click(screen.getByText('Mark Resolved'));
    await waitFor(() => {
      expect(onBatch).toHaveBeenCalledWith(['1', '2', '3'], 'resolved');
    });
    expect(screen.queryByText('3 tickets selected')).not.toBeInTheDocument();
  });

  it('exports CSV when onExport provided', () => {
    const onExport = vi.fn();
    render(<TicketList tickets={tickets} isAdmin onExport={onExport} />);
    fireEvent.click(screen.getByText('Export All'));
    expect(onExport).toHaveBeenCalledWith(tickets);
  });

  it('shows attachment count when tickets have attachments', () => {
    const withAttachments = [
      { ...tickets[0], attachments: [{ file_name: 'a.png', file_url: '/a.png', file_size: 10, file_type: 'image/png' }] },
    ];
    render(<TicketList tickets={withAttachments} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
