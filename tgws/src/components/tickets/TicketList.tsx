'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Clock, ArrowRight } from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  category: string;
  created_at: string;
}

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
  const t = useTranslations('auth');

  const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    open: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      dot: 'bg-yellow-500',
      label: t('ticketOpen'),
    },
    in_progress: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      dot: 'bg-blue-500',
      label: t('ticketInProgress'),
    },
    resolved: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      dot: 'bg-green-500',
      label: t('ticketResolved'),
    },
    closed: {
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      dot: 'bg-gray-400',
      label: t('ticketClosed'),
    },
  };

  const categoryLabels: Record<string, string> = {
    build: 'Build',
    run: 'Run',
    protect: 'Protect',
  };

  const categoryColors: Record<string, string> = {
    build: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
    run: 'bg-[#7B61FF]/10 text-[#7B61FF] border-[#7B61FF]/20',
    protect: 'bg-green-50 text-green-600 border-green-200',
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={28} className="text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">{t('noTickets')}</p>
        <p className="text-gray-600 text-sm mt-2">Submit a ticket to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const status = statusConfig[ticket.status] || statusConfig.open;
        return (
          <div
            key={ticket.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {ticket.ticket_number}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded border ${
                      categoryColors[ticket.category] || 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {categoryLabels[ticket.category] || ticket.category}
                  </span>
                </div>
                <h3 className="text-gray-900 font-medium truncate">{ticket.subject}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')} PHT
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                  <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                </div>
                <ArrowRight
                  size={16}
                  className="text-gray-300 group-hover:text-gray-600 transition-colors"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
