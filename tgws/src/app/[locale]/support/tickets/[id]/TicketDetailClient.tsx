'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft,
  Paperclip,
  MessageSquare,
  Download,
  Shield,
  User,
  Send,
  Loader2,
  Lock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { TicketDetailData } from './page';

interface Props {
  ticket: TicketDetailData;
  locale: string;
  currentUserId: string;
  currentUserEmail: string | null;
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'] as const;
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'] as const;

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  open: { bg: 'bg-yellow-50', text: 'text-yellow-600', dot: 'bg-yellow-500' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  resolved: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
};

const PRIORITY_STYLE: Record<string, string> = {
  low: 'bg-gray-50 text-gray-600 border-gray-200',
  medium: 'bg-blue-50 text-blue-600 border-blue-200',
  high: 'bg-orange-50 text-orange-600 border-orange-200',
  critical: 'bg-red-50 text-red-600 border-red-200',
};

function formatDateTime(iso: string | null, locale: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TicketDetailClient({
  ticket,
  locale,
  currentUserId,
  currentUserEmail,
}: Props) {
  const t = useTranslations('support.ticketDetail');

  const [status, setStatus] = useState<string>(ticket.status);
  const [priority, setPriority] = useState<string>(ticket.priority || 'medium');
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(ticket.comments);
  const [version, setVersion] = useState<number>(ticket.version || 1);

  const isAdmin = ticket.is_admin_viewer;

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      open: t('statusOpen'),
      in_progress: t('statusInProgress'),
      resolved: t('statusResolved'),
      closed: t('statusClosed'),
    };
    return map[s] || s;
  };

  const priorityLabel = (p: string) => {
    const map: Record<string, string> = {
      low: t('priorityLow'),
      medium: t('priorityMedium'),
      high: t('priorityHigh'),
      critical: t('priorityCritical'),
    };
    return map[p] || p;
  };

  const showFlash = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- Admin: change status -------------------------------------------------
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, version }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showFlash('error', data?.error?.message || 'Failed to update status');
        setSubmitting(false);
        return;
      }
      setStatus(newStatus);
      setVersion((data.data?.version as number) || version + 1);
      showFlash('success', t('statusUpdated'));
    } catch (err) {
      showFlash('error', String(err));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Admin: change priority ----------------------------------------------
  const handlePriorityChange = async (newPriority: string) => {
    if (newPriority === priority) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority, version }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showFlash('error', data?.error?.message || 'Failed to update priority');
        setSubmitting(false);
        return;
      }
      setPriority(newPriority);
      setVersion((data.data?.version as number) || version + 1);
      showFlash('success', t('statusUpdated'));
    } catch (err) {
      showFlash('error', String(err));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Add comment ----------------------------------------------------------
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const payload: Record<string, unknown> = { comment, version };
      if (isAdmin && isInternal) {
        payload.isInternal = true;
      }
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showFlash('error', data?.error?.message || 'Failed to add comment');
        setSubmitting(false);
        return;
      }
      if (data.comment) {
        setLocalComments((prev) => [...prev, data.comment]);
      }
      setVersion((data.data?.version as number) || version + 1);
      setComment('');
      setIsInternal(false);
      showFlash('success', t('commentAdded'));
    } catch (err) {
      showFlash('error', String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = STATUS_STYLE[status] || STATUS_STYLE.open;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/${locale}/support`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#00D4FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 rounded-md px-1 py-0.5"
      >
        <ArrowLeft size={16} />
        {t('backToList')}
      </Link>

      {/* Feedback banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-3 rounded-xl p-4 text-sm border ${
            feedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle size={16} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="flex-shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Ticket header card */}
      <section className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                {ticket.ticket_number}
              </span>
              <span
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {statusLabel(status)}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded border ${
                  PRIORITY_STYLE[priority] || PRIORITY_STYLE.medium
                }`}
              >
                {priorityLabel(priority)}
              </span>
              {ticket.category && (
                <span className="text-xs font-medium px-2 py-0.5 rounded border bg-gray-50 text-gray-600 border-gray-200">
                  {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                </span>
              )}
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20">
                  <Shield size={11} />
                  {t('viewAsAdmin')}
                </span>
              )}
            </div>
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white break-words">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Meta info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('productService')}</p>
            <p className="text-sm text-gray-900 dark:text-white break-words">
              {ticket.product_service || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('assignedTo')}</p>
            <p className="text-sm text-gray-900 dark:text-white break-words">
              {ticket.assigned_to_email || t('unassigned')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('created')}</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatDateTime(ticket.created_at, locale)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('updated')}</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatDateTime(ticket.updated_at, locale)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('occurredAt')}</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatDateTime(ticket.occurred_at, locale)}
            </p>
          </div>
        </div>
      </section>

      {/* Admin controls */}
      {isAdmin && (
        <section className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield size={14} className="text-[#00D4FF]" />
            {t('changeStatus')} / {t('changePriority')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                {t('status')}
              </span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={submitting}
                aria-label={t('changeStatus')}
                className="w-full bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                {t('priority')}
              </span>
              <select
                value={priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                disabled={submitting}
                aria-label={t('changePriority')}
                className="w-full bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all disabled:opacity-50"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {priorityLabel(p)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      )}

      {/* Description */}
      <section className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 lg:p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <MessageSquare size={14} className="text-[#00D4FF]" />
          {t('description')}
        </h2>
        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
          {ticket.description || '—'}
        </div>
      </section>

      {/* Attachments */}
      <section className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 lg:p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Paperclip size={14} className="text-[#00D4FF]" />
          {t('attachments')}
          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
            ({ticket.attachments.length})
          </span>
        </h2>
        {ticket.attachments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('noAttachments')}</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-700">
            {ticket.attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Paperclip size={16} className="text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {a.file_name || 'unnamed'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(a.file_size)}
                    </p>
                  </div>
                </div>
                {a.file_url && (
                  <a
                    href={a.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00D4FF] hover:underline px-3 py-1.5 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
                    aria-label={`${t('download')} ${a.file_name || ''}`}
                  >
                    <Download size={12} />
                    {t('download')}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Comments */}
      <section className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 lg:p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare size={14} className="text-[#00D4FF]" />
          {t('comments')}
          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
            ({localComments.length})
          </span>
        </h2>

        {localComments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('noComments')}</p>
        ) : (
          <ul className="space-y-4 mb-6">
            {localComments.map((c) => {
              const isOwn = c.user_id === currentUserId;
              const authorLabel = isOwn
                ? currentUserEmail || 'You'
                : t('replyFromSupport');
              return (
                <li
                  key={c.id}
                  className={`rounded-xl p-4 border ${
                    c.is_internal
                      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                      : 'bg-gray-50 dark:bg-zinc-700/50 border-gray-100 dark:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] flex items-center justify-center flex-shrink-0">
                        {c.is_internal ? <Lock size={12} /> : <User size={12} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {authorLabel}
                          {c.is_internal && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-amber-700 dark:text-amber-400">
                              <Lock size={9} />
                              {t('internalNote')}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {formatDateTime(c.created_at, locale)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words pl-9">
                    {c.content}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Add comment form */}
        <form onSubmit={handleCommentSubmit} className="border-t border-gray-100 dark:border-zinc-700 pt-4">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
            {t('addComment')}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={4000}
            disabled={submitting}
            placeholder={t('commentPlaceholder')}
            className="w-full bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all resize-none disabled:opacity-50"
          />
          {isAdmin && (
            <label className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                disabled={submitting}
                className="rounded border-gray-300 text-[#00D4FF] focus:ring-[#00D4FF]"
              />
              <Lock size={11} />
              {t('internalNote')}
            </label>
          )}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="inline-flex items-center gap-2 bg-[#00D4FF] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  <Send size={14} />
                  {t('submitComment')}
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
