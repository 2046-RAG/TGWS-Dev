'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPasswordForm() {
  const t = useTranslations('support.resetPassword');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const validatePassword = (value: string): string | null => {
    if (value.length < 8) {
      return t('minLength');
    }
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      return t('requireLettersAndNumbers');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('mismatch'));
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        // Don't leak Supabase raw error message
        setError(t('updateFailed'));
      } else {
        setSuccess(true);
        // Redirect to login after a short delay so the user sees the success state
        setTimeout(() => {
          const redirect = searchParams.get('redirect');
          const target = redirect && redirect.startsWith(`/${locale}/`)
            ? redirect
            : `/${locale}/support/login?reset=success`;
          router.push(target);
        }, 1500);
      }
    } catch {
      setError(t('updateFailed'));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center py-8" role="status" aria-live="polite">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {t('successTitle')}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{t('successDesc')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label={t('title')}>
      {error && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-red-600 dark:text-red-400 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="reset-password"
          className="block text-sm text-gray-700 dark:text-gray-200 mb-2"
        >
          {t('newPassword')}
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            id="reset-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
            placeholder={t('passwordPlaceholder')}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('hint')}
        </p>
      </div>

      <div>
        <label
          htmlFor="reset-confirm"
          className="block text-sm text-gray-700 dark:text-gray-200 mb-2"
        >
          {t('confirmPassword')}
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            id="reset-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
            placeholder={t('confirmPasswordPlaceholder')}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#00D4FF] text-white font-medium py-3 rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  );
}
