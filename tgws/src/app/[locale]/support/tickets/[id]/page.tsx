'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { ArrowLeft, Send, Clock, MessageSquare } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  user_id: string;
}
interface TicketDetail {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  comments?: Comment[];
}

const card = 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6';
const fmt = (v: string, locale: string) =>
  new Date(v).toLocaleString(locale === 'zh' ? 'zh-TW' : 'en-US');

export default function CustomerTicketConversationPage() {
  const s = useTranslations('support');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const id = String(params?.id || '');

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tickets/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        if (!cancelled) {
          setTicket(j.data || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setError('');
    try {
      const r = await fetch(`/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setText('');
      setReloadKey((k) => k + 1);
    } catch {
      setError(s('replyFailed'));
    } finally {
      setSending(false);
    }
  };

  const comments = ticket?.comments || [];

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#09090B] py-10 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb
          items={[
            { label: s('supportCenter'), href: `/${locale}/support` },
            { label: ticket?.ticket_number || s('viewConversation') },
          ]}
          locale={locale}
        />
        <Link
          href={`/${locale}/support`}
          className="inline-flex items-center gap-2 mt-6 mb-6 text-sm text-[#00B8DB] hover:underline"
        >
          <ArrowLeft size={16} /> {s('backToTickets')}
        </Link>

        {loading && <div className={`${card} text-gray-500`}>…</div>}

        {!loading && ticket && (
          <div className="space-y-6">
            <section className={card}>
              <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{ticket.ticket_number}</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{ticket.subject}</h1>
              <p className="mt-4 text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                {ticket.description || '—'}
              </p>
            </section>

            <section className={card}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <MessageSquare size={18} /> {s('conversation')}
              </h2>
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{s('noComments')}</p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li key={c.id} className="rounded-xl border border-gray-100 dark:border-zinc-700 p-4">
                      <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{s('reply')}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {fmt(c.created_at, locale)}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{c.content}</p>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={submit} className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-700">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={s('replyPlaceholder')}
                  aria-label={s('reply')}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-gray-100"
                />
                {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] text-white text-sm font-medium disabled:opacity-40"
                >
                  <Send size={14} /> {s('sendReply')}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
