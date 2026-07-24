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
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-600 dark:text-yellow-400',
      dot: 'bg-yellow-500 dark:bg-yellow-400',
      label: t('ticketOpen'),
    },
    in_progress: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      dot: 'bg-blue-500 dark:bg-blue-400',
      label: t('ticketInProgress'),
    },
    resolved: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      dot: 'bg-green-500 dark:bg-green-400',
      label: t('ticketResolved'),
    },
    closed: {
      bg: 'bg-gray-100 dark:bg-zinc-700',
      text: 'text-gray-500 dark:text-gray-400',
      dot: 'bg-gray-400 dark:bg-gray-500',
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
    protect: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={28} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noTickets')}</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Submit a ticket to get started</p>
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
            role="listitem"
            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-600 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                    {ticket.ticket_number}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded border ${
                      categoryColors[ticket.category] || 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700'
                    }`}
                  >
                    {categoryLabels[ticket.category] || ticket.category}
                  </span>
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium truncate">{ticket.subject}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                  className="text-gray-300 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-400 transition-colors"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
