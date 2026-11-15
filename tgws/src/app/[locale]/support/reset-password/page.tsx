'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Lock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * T-071: the password-reset email used to point at /api/auth/reset-password,
 * a POST-only endpoint, so clicking the link returned 405. This page is the
 * real destination. It supports both Supabase recovery-link formats:
 *   - PKCE:      ?code=...  -> exchangeCodeForSession
 *   - implicit:  #access_token=...&type=recovery (handled by supabase-js)
 */
export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const supabase = useMemo(() => createClient(), []);

  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!cancelled && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) {
        setReady(true);
        setChecking(false);
      }
    });

    const establish = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError && !cancelled) setError(t('invalidResetLink'));
      }
      // supabase-js detects an implicit recovery link from the URL hash and
      // establishes the session itself; getSession() then confirms it.
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        if (data.session) setReady(true);
        setChecking(false);
      }
    };
    void establish().catch(() => {
      if (!cancelled) setChecking(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, t]);

  const inputClass =
    'w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t('passwordMinLength'));
      return;
    }
    if (password !== confirm) {
      setError(t('passwordMismatch'));
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(t('resetFailed'));
      } else {
        setDone(true);
        // Drop the recovery token from the URL/history.
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      setError(t('resetFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-20 px-5 sm:px-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('resetTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('resetDesc')}</p>
      </div>

      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#00D4FF]" />

        {checking && (
          <p role="status" className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
            <Loader2 size={18} className="inline animate-spin mr-2" />
            {t('checkingResetLink')}
          </p>
        )}

        {!checking && !ready && !done && (
          <div role="alert" className="text-sm text-red-600 dark:text-red-400">
            <p>{error || t('invalidResetLink')}</p>
            <Link
              href={`/${locale}/support/login`}
              className="inline-flex items-center text-[#00D4FF] hover:underline min-h-[44px] py-1 mt-2"
            >
              {t('backToLogin')}
            </Link>
          </div>
        )}

        {!checking && ready && !done && (
          <form onSubmit={submit} className="space-y-6" aria-label={t('resetTitle')}>
            {error && (
              <div id="reset-error" role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="new-password" className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
                {t('newPassword')}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={error ? 'true' : undefined}
                  aria-describedby={error ? 'reset-error' : undefined}
                  placeholder={t('newPasswordPlaceholder')}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
                {t('confirmNewPassword')}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-required="true"
                  placeholder={t('confirmNewPassword')}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00D4FF] text-white font-medium disabled:opacity-40 min-h-[44px]"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? t('updatingPassword') : t('updatePassword')}
            </button>
          </form>
        )}

        {done && (
          <div role="status" className="text-sm text-green-600 dark:text-green-400">
            <p>{t('passwordUpdated')}</p>
            <Link
              href={`/${locale}/support/login`}
              className="inline-flex items-center text-[#00D4FF] hover:underline min-h-[44px] py-1 mt-2"
            >
              {t('backToLogin')}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
