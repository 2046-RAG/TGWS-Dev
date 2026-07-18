import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TicketList from './TicketList';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const m: Record<string, string> = {
      ticketOpen: 'Open',
      ticketInProgress: 'In Progress',
      ticketResolved: 'Resolved',
      ticketClosed: 'Closed',
      noTickets: 'No tickets',
      submitTicketHint: 'Submit a ticket to get started',
      openTicket: 'Open ticket',
    };
    return m[key] || key;
  },
  useLocale: () => 'en',
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('TicketList', () => {
  it('shows empty state with no tickets', () => {
    render(<TicketList tickets={[]} />);

    expect(screen.getByText('No tickets')).toBeInTheDocument();
    expect(screen.getByText('Submit a ticket to get started')).toBeInTheDocument();
  });

  it('renders ticket list', () => {
    const tickets = [
      {
        id: '1',
        ticket_number: 'TK-001',
        subject: 'First ticket',
        status: 'open',
        category: 'build',
        created_at: '2024-01-15T10:30:00Z',
      },
    ];

    render(<TicketList tickets={tickets} />);

    expect(screen.getByText('TK-001')).toBeInTheDocument();
    expect(screen.getByText('First ticket')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
  });

  it('displays correct status badge', () => {
    const tickets = [
      {
        id: '1',
        ticket_number: 'TK-001',
        subject: 'Test ticket',
        status: 'in_progress',
        category: 'run',
        created_at: '2024-01-15T10:30:00Z',
      },
    ];

    render(<TicketList tickets={tickets} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('displays correct category badge', () => {
    const tickets = [
      {
        id: '1',
        ticket_number: 'TK-001',
        subject: 'Test ticket',
        status: 'resolved',
        category: 'protect',
        created_at: '2024-01-15T10:30:00Z',
      },
    ];

    render(<TicketList tickets={tickets} />);

    expect(screen.getByText('Protect')).toBeInTheDocument();
  });
});