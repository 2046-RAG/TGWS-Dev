'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AttachmentPreview from '@/components/tickets/AttachmentPreview';
import { ArrowLeft, Clock, Paperclip, MessageSquare, History, Send } from 'lucide-react';

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
const fieldClass = 'mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-gray-100';
const dateFmt = (v: string | null | undefined, locale: string) =>
  v ? new Date(v).toLocaleString(locale === 'zh' ? 'zh-TW' : 'en-US') : '—';

export default function AdminTicketDetailPage() {
  const t = useTranslations('admin');
  const tAuth = useTranslations('auth');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const id = String(params?.id || '');

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [internalNote, setInternalNote] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [staff, setStaff] = useState<{ id: string; email: string; full_name?: string | null }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Audit rows store raw codes (status_changed, open, medium...). Render them
  // as human-readable sentences so the timeline is useful to support staff.
  const auditActionLabel: Record<string, string> = {
    created: t('auditCreated'),
    status_changed: t('auditStatusChanged'),
    updated: t('auditUpdated'),
    comment_added: t('auditCommentAdded'),
    assigned: t('auditAssigned'),
  };
  const humanField: Record<string, string> = {
    status: t('status'), priority: t('colPriority'), assigned_to: t('assignedTo'),
    is_internal: t('colInternal'), product_service: t('colProduct'),
  };
  const statusLabelLocal = (v: unknown): string => {
    const map: Record<string, string> = {
      open: tAuth('ticketOpen'), in_progress: tAuth('ticketInProgress'),
      resolved: tAuth('ticketResolved'), closed: tAuth('ticketClosed'),
    };
    return typeof v === 'string' ? (map[v] || '') : '';
  };
  const priorityLabelLocal = (v: unknown): string => {
    const map: Record<string, string> = {
      low: t('low'), medium: t('medium'), high: t('high'), critical: t('critical'),
    };
    return typeof v === 'string' ? (map[v] || '') : '';
  };
  const humanAuditValue = (v: string | null): string => {
    if (!v) return '—';
    // Audit rows store JSON objects like {"status":"open"} or
    // {"is_internal":true}. Summarise them instead of dumping raw JSON.
    try {
      const parsed = JSON.parse(v) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const parts = Object.entries(parsed).map(([key, val]) => {
          const label = humanField[key] || key;
          const value = typeof val === 'boolean'
            ? (val ? t('yes') : t('no'))
            : (statusLabelLocal(val) || priorityLabelLocal(val) || String(val));
          return `${label}: ${value}`;
        });
        return parts.join(', ');
      }
    } catch {
      /* not JSON — fall through */
    }
    return statusLabelLocal(v) || priorityLabelLocal(v) || v;
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // Error is cleared on success below; avoid a synchronous setState here
    // (react-hooks/set-state-in-effect).
    const controller = new AbortController();
    // Never leave the admin detail page spinning forever (same fix as the
    // customer detail page). A hanging request shows a visible error + retry.
    const timer = setTimeout(() => controller.abort(), 8_000);
    fetch(`/api/tickets/${id}`, { signal: controller.signal, cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((j) => {
        if (cancelled) return;
        const d = j.data;
        setTicket(d || null);
        if (d) {
          setEditStatus(d.status || 'open');
          setEditPriority(d.priority || 'medium');
          setAssignee(d.assigned_to || '');
        }
        setError('');
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const aborted = e instanceof DOMException && e.name === 'AbortError';
          setError(aborted ? (t('loadError') + ' (timeout)') : t('loadError'));
        }
      })
      .finally(() => {
        clearTimeout(timer);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
      cancelled = true;
    };
  }, [id, t, reloadKey]);

  // T-059: staff list for the assignment dropdown.
  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => setStaff(Array.isArray(j.data) ? j.data : []))
      .catch(() => setStaff([]));
  }, []);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const r = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          priority: editPriority,
          assignedTo: assignee || null,
        }),
      });
      if (r.status === 409) {
        // Optimistic lock lost: another agent saved first.
        setSaveMsg(t('saveConflict'));
        return;
      }
      if (!r.ok) throw new Error(String(r.status));
      setSaveMsg(t('saved'));
      setReloadKey((k) => k + 1);
    } catch {
      setSaveMsg(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const submitReply = async (e: FormEvent) => {
    e.preventDefault();
    const content = reply.trim();
    if (!content || sendingReply) return;
    setSendingReply(true);
    setReplyError('');
    try {
      const r = await fetch(`/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, isInternal: internalNote }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setReply('');
      setInternalNote(false);
      setReloadKey((k) => k + 1);
    } catch {
      setReplyError(t('replyFailed'));
    } finally {
      setSendingReply(false);
    }
  };

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

        {loading && (
          <div className={`${card} text-sm text-gray-500 dark:text-gray-400`}>
            <span className="inline-block w-3 h-3 mr-2 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
            {t('loadingTicket')}
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => { setLoading(true); setReloadKey((k) => k + 1); }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#00D4FF] text-white text-xs"
            >
              {t('retry')}
            </button>
          </div>
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

            <section className={card}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('actions')}</h2>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <label className="block">
                  <span className="text-gray-500 dark:text-gray-400">{t('changeStatus')}</span>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={fieldClass}>
                    <option value="open">{t('statusOpen')}</option>
                    <option value="in_progress">{t('statusInProgress')}</option>
                    <option value="resolved">{t('statusResolved')}</option>
                    <option value="closed">{t('statusClosed')}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-gray-500 dark:text-gray-400">{t('changePriority')}</span>
                  <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className={fieldClass}>
                    <option value="low">{t('low')}</option>
                    <option value="medium">{t('medium')}</option>
                    <option value="high">{t('high')}</option>
                    <option value="critical">{t('critical')}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-gray-500 dark:text-gray-400">{t('assignedTo')}</span>
                  <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={fieldClass}>
                    <option value="">{t('selectAssignee')}</option>
                    {staff.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#00D4FF] text-white text-sm font-medium disabled:opacity-40"
                >
                  {saving ? t('saving') : t('saveChanges')}
                </button>
                {saveMsg && <span className="text-sm text-gray-600 dark:text-gray-300">{saveMsg}</span>}
              </div>
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

              <form onSubmit={submitReply} className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-700">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={t('replyPlaceholder')}
                  aria-label={t('comments')}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-gray-100"
                />
                <label className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={internalNote}
                    onChange={(e) => setInternalNote(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  {t('internalNoteToggle')}
                </label>
                {replyError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{replyError}</p>}
                <button
                  type="submit"
                  disabled={sendingReply || !reply.trim()}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] text-white text-sm font-medium disabled:opacity-40"
                >
                  <Send size={14} /> {t('sendReply')}
                </button>
              </form>
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
                        <span className="font-medium text-gray-900 dark:text-white">
                          {auditActionLabel[a.action] || a.action}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{dateFmt(a.performed_at, locale)}</span>
                      </div>
                      {(a.old_value || a.new_value) && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 break-all">
                          {humanAuditValue(a.old_value)} → {humanAuditValue(a.new_value)}
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
