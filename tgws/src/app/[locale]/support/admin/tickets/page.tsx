'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, Search, ArrowUpRight } from 'lucide-react';

interface TicketRow {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  category: string;
  priority: string;
  created_at: string;
  assigned_to: string | null;
  user_id: string;
}

const PAGE_SIZE = 20;

const statusClass: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-300',
};

export default function AdminTicketsPage() {
  const t = useTranslations('admin');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [rows, setRows] = useState<TicketRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const sp = new URLSearchParams({
      scope: 'all',
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (status) sp.set('status', status);
    if (category) sp.set('category', category);
    if (priority) sp.set('priority', priority);

    fetch(`/api/tickets?${sp.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        if (cancelled) return;
        setRows(Array.isArray(j.data) ? j.data : []);
        setTotal(Number(j.total) || 0);
        setError('');
      })
      .catch(() => {
        if (!cancelled) setError(t('loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, status, category, priority, reloadKey, t]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.ticket_number} ${r.subject}`.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const hasNext = page * PAGE_SIZE < total;

  // T-059: export the rows currently visible (this page of the current filter).
  const exportCsv = () => {
    const header = ['Ticket #', 'Subject', 'Status', 'Category', 'Priority', 'Created'];
    const rows = visible.map((r) => [
      r.ticket_number, r.subject, r.status, r.category, r.priority, r.created_at,
    ]);
    const csv = [header, ...rows]
      .map((cols) => cols.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-page-${page}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const statusLabel = (s: string) =>
    ({ open: t('statusOpen'), in_progress: t('statusInProgress'), resolved: t('statusResolved'), closed: t('statusClosed') }[s] || s);

  const selectClass =
    'px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-gray-100';

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#09090B] py-10 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb
          items={[
            { label: t('adminDashboard'), href: `/${locale}/support/admin/dashboard` },
            { label: t('allTickets') },
          ]}
          locale={locale}
        />

        <div className="flex flex-wrap items-start justify-between gap-4 mt-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('allTickets')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('allTicketsDesc')}</p>
          </div>
          <Link
            href={`/${locale}/support/admin/dashboard`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-zinc-800"
          >
            <ArrowLeft size={16} /> {t('backToDashboard')}
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-5 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchPlaceholder')}
                className={`${selectClass} w-full pl-9`}
              />
            </div>
            <select aria-label={t('filterStatus')} value={status} onChange={(e) => { setLoading(true); setStatus(e.target.value); setPage(1); }} className={selectClass}>
              <option value="">{t('filterStatus')}: {t('all')}</option>
              <option value="open">{t('statusOpen')}</option>
              <option value="in_progress">{t('statusInProgress')}</option>
              <option value="resolved">{t('statusResolved')}</option>
              <option value="closed">{t('statusClosed')}</option>
            </select>
            <select aria-label={t('filterCategory')} value={category} onChange={(e) => { setLoading(true); setCategory(e.target.value); setPage(1); }} className={selectClass}>
              <option value="">{t('filterCategory')}: {t('all')}</option>
              <option value="build">{t('categoryBuild')}</option>
              <option value="run">{t('categoryRun')}</option>
              <option value="protect">{t('categoryProtect')}</option>
            </select>
            <select aria-label={t('filterPriority')} value={priority} onChange={(e) => { setLoading(true); setPriority(e.target.value); setPage(1); }} className={selectClass}>
              <option value="">{t('filterPriority')}: {t('all')}</option>
              <option value="low">{t('low')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="high">{t('high')}</option>
              <option value="critical">{t('critical')}</option>
            </select>
            <button
              type="button"
              onClick={exportCsv}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700"
            >
              {t('exportCsv')}
            </button>
            <button
              type="button"
              onClick={() => { setLoading(true); setReloadKey((k) => k + 1); }}
              aria-label={t('retry')}
              className="p-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}{' '}
            <button type="button" className="underline" onClick={() => { setLoading(true); setReloadKey((k) => k + 1); }}>{t('retry')}</button>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">{t('ticketNumber')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('subject')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('status')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('filterCategory')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('priority')}</th>
                  <th className="text-left px-5 py-3 font-medium">{t('created')}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-500">…</td></tr>
                )}
                {!loading && visible.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">{t('noResults')}</td></tr>
                )}
                {!loading && visible.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 dark:border-zinc-700/60 hover:bg-gray-50 dark:hover:bg-zinc-700/30">
                    <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{r.ticket_number}</td>
                    <td className="px-5 py-3 text-gray-900 dark:text-white max-w-[280px] truncate">{r.subject}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] || statusClass.closed}`}>
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{r.category}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{r.priority}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString(locale === 'zh' ? 'zh-TW' : 'en-US') : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/${locale}/support/admin/tickets/${r.id}`}
                        className="inline-flex items-center gap-1 text-[#00B8DB] hover:underline"
                      >
                        {t('viewDetails')} <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 dark:border-zinc-700 text-sm text-gray-500 dark:text-gray-400">
            <span>{t('showing', { from, to, total })}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => { setLoading(true); setPage((p) => Math.max(1, p - 1)); }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> {t('previous')}
              </button>
              <button
                type="button"
                disabled={!hasNext}
                onClick={() => { setLoading(true); setPage((p) => p + 1); }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 disabled:opacity-40"
              >
                {t('next')} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
