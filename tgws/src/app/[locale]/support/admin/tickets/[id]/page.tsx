'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AttachmentPreview from '@/components/tickets/AttachmentPreview';
import { ArrowLeft, Clock, Paperclip, MessageSquare, History } from 'lucide-react';

interface Attachment {
  id?: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
}
interface Comment {
  id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  user_id: string;
}
interface AuditEntry {
  id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  performed_at: string;
}
interface TicketDetail {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  occurred_at: string | null;
  assigned_to: string | null;
  user_id: string;
  attachments?: Attachment[];
  comments?: Comment[];
  audit?: AuditEntry[];
}

const card = 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6';
const dateFmt = (v: string | null | undefined, locale: string) =>
  v ? new Date(v).toLocaleString(locale === 'zh' ? 'zh-TW' : 'en-US') : '—';

export default function AdminTicketDetailPage() {
  const t = useTranslations('admin');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const id = String(params?.id || '');

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/tickets/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        if (cancelled) return;
        setTicket(j.data || null);
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
  }, [id, t]);

  const statusLabel =
    ({ open: t('statusOpen'), in_progress: t('statusInProgress'), resolved: t('statusResolved'), closed: t('statusClosed') }[ticket?.status || ''] || ticket?.status);

  const attachments = (ticket?.attachments || []).map((a) => ({
    id: a.id,
    file_name: a.file_name || 'attachment',
    file_url: a.file_url || '',
    file_size: Number(a.file_size) || 0,
    file_type: a.file_type || 'application/octet-stream',
  }));

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#09090B] py-10 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <Breadcrumb
          items={[
            { label: t('adminDashboard'), href: `/${locale}/support/admin/dashboard` },
            { label: t('allTickets'), href: `/${locale}/support/admin/tickets` },
            { label: ticket?.ticket_number || t('ticketDetail') },
          ]}
          locale={locale}
        />

        <Link
          href={`/${locale}/support/admin/tickets`}
          className="inline-flex items-center gap-2 mt-6 mb-6 text-sm text-[#00B8DB] hover:underline"
        >
          <ArrowLeft size={16} /> {t('backToList')}
        </Link>

        {loading && <div className={`${card} text-gray-500 dark:text-gray-400`}>…</div>}

        {!loading && error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">{error}</div>
        )}

        {!loading && !error && !ticket && (
          <div className={`${card} text-gray-500 dark:text-gray-400`}>{t('notFound')}</div>
        )}

        {!loading && ticket && (
          <div className="space-y-6">
            <section className={card}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{ticket.ticket_number}</p>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{ticket.subject}</h1>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{statusLabel}</span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-200">{ticket.priority}</span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-200">{ticket.category}</span>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{t('description')}</h2>
                <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{ticket.description || '—'}</p>
              </div>

              <dl className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-zinc-700 text-sm">
                <div><dt className="text-gray-500 dark:text-gray-400">{t('customer')}</dt><dd className="font-mono text-xs text-gray-800 dark:text-gray-200 mt-1 break-all">{ticket.user_id}</dd></div>
                <div><dt className="text-gray-500 dark:text-gray-400">{t('assignedTo')}</dt><dd className="font-mono text-xs text-gray-800 dark:text-gray-200 mt-1 break-all">{ticket.assigned_to || t('unassigned')}</dd></div>
                <div><dt className="text-gray-500 dark:text-gray-400">{t('created')}</dt><dd className="text-gray-800 dark:text-gray-200 mt-1">{dateFmt(ticket.created_at, locale)}</dd></div>
                <div><dt className="text-gray-500 dark:text-gray-400">{t('occurredAt')}</dt><dd className="text-gray-800 dark:text-gray-200 mt-1">{dateFmt(ticket.occurred_at, locale)}</dd></div>
              </dl>
            </section>

            {/* D-01: attachment preview is implemented, not dead code */}
            <section className={card}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Paperclip size={18} /> {t('attachments')}
              </h2>
              {attachments.length > 0 ? (
                <AttachmentPreview attachments={attachments} />
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('noAttachments')}</p>
              )}
            </section>

            <section className={card}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <MessageSquare size={18} /> {t('comments')}
              </h2>
              {(ticket.comments || []).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('noComments')}</p>
              ) : (
                <ul className="space-y-3">
                  {(ticket.comments || []).map((c) => (
                    <li key={c.id} className="rounded-xl border border-gray-100 dark:border-zinc-700 p-4">
                      <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-mono">{c.user_id}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {dateFmt(c.created_at, locale)}</span>
                      </div>
                      {c.is_internal && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          {t('internalNote')}
                        </span>
                      )}
                      <p className="mt-2 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{c.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={card}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <History size={18} /> {t('auditTrail')}
              </h2>
              {(ticket.audit || []).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('noAudit')}</p>
              ) : (
                <ul className="space-y-3">
                  {(ticket.audit || []).map((a) => (
                    <li key={a.id} className="border-l-2 border-[#00D4FF] pl-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{a.action}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{dateFmt(a.performed_at, locale)}</span>
                      </div>
                      {(a.old_value || a.new_value) && (
                        <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400 break-all">
                          {a.old_value || '—'} → {a.new_value || '—'}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
