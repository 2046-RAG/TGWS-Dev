'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Clock, ArrowRight, CheckSquare, Square, Download, RefreshCw, CheckCircle, Paperclip, Search, X } from 'lucide-react';
import AttachmentPreview from './AttachmentPreview';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  category: string;
  created_at: string;
  attachments?: { file_name: string; file_url: string; file_size: number; file_type: string }[];
}

interface TicketListProps {
  tickets: Ticket[];
  isAdmin?: boolean;
  onBatchStatusUpdate?: (ids: string[], status: string) => Promise<void>;
  onExport?: (tickets: Ticket[]) => void;
}

export default function TicketList({ tickets, isAdmin = false, onBatchStatusUpdate, onExport }: TicketListProps) {
  const t = useTranslations('auth');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tickets based on search
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;

    const query = searchQuery.toLowerCase();
    return tickets.filter(ticket => {
      const ticketNumber = ticket.ticket_number.toLowerCase();
      const subject = ticket.subject.toLowerCase();
      const status = ticket.status.toLowerCase();
      const category = ticket.category.toLowerCase();
      return ticketNumber.includes(query) || subject.includes(query) || status.includes(query) || category.includes(query);
    });
  }, [tickets, searchQuery]);

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

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === tickets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tickets.map(t => t.id)));
    }
  };

  const handleBatchStatus = async (status: string) => {
    if (!onBatchStatusUpdate || selectedIds.size === 0) return;
    setBatchLoading(true);
    try {
      await onBatchStatusUpdate(Array.from(selectedIds), status);
      setSelectedIds(new Set());
    } finally {
      setBatchLoading(false);
    }
  };

  const handleExport = () => {
    if (onExport) {
      const selectedTickets = tickets.filter(t => selectedIds.has(t.id));
      onExport(selectedTickets.length > 0 ? selectedTickets : tickets);
    }
  };

  const exportToCSV = (data: Ticket[]) => {
    const headers = ['Ticket #', 'Subject', 'Status', 'Category', 'Created'];
    const rows = data.map(t => [
      t.ticket_number,
      t.subject,
      t.status,
      t.category,
      format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      {/* Search Box */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchTickets')}
          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl pl-11 pr-10 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* No Results Message */}
      {searchQuery && filteredTickets.length === 0 && (
        <div className="text-center py-8">
          <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('noTicketsFound')}</p>
        </div>
      )}
      {/* Batch Action Bar */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-[#00D4FF] font-medium">
            {selectedIds.size} ticket{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchStatus('in_progress')}
              disabled={batchLoading}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw size={14} className={batchLoading ? 'animate-spin' : ''} />
              Mark In Progress
            </button>
            <button
              onClick={() => handleBatchStatus('resolved')}
              disabled={batchLoading}
              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle size={14} />
              Mark Resolved
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 flex items-center gap-1"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>
      )}

      {/* Export button when no selection */}
      {isAdmin && selectedIds.size === 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 flex items-center gap-1"
          >
            <Download size={14} />
            Export All
          </button>
        </div>
      )}

      {/* Select All */}
      {isAdmin && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {selectedIds.size === tickets.length ? (
              <CheckSquare size={16} className="text-[#00D4FF]" />
            ) : (
              <Square size={16} />
            )}
            Select all
          </button>
        </div>
      )}

      {/* Ticket List */}
      {filteredTickets.map((ticket) => {
        const status = statusConfig[ticket.status] || statusConfig.open;
        const isSelected = selectedIds.has(ticket.id);
        return (
          <div
            key={ticket.id}
            role="listitem"
            className={`bg-white dark:bg-zinc-800 border rounded-xl p-5 hover:shadow-md transition-all duration-200 group ${
              isSelected
                ? 'border-[#00D4FF] dark:border-[#00D4FF]'
                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Checkbox */}
                {isAdmin && (
                  <button
                    onClick={() => toggleSelect(ticket.id)}
                    className="shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare size={18} className="text-[#00D4FF]" />
                    ) : (
                      <Square size={18} className="text-gray-300 dark:text-zinc-500" />
                    )}
                  </button>
                )}

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
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')} PHT
                    </p>
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Paperclip size={12} />
                        {ticket.attachments.length}
                      </span>
                    )}
                  </div>
                </div>
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