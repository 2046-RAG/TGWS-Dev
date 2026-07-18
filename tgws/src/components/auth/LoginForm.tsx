'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });

      if (error) {
        setError(error.message);
      } else {
        router.push(`/${locale}/support`);
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/support/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(t('resetEmailSent'));
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleOAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  return (
    <form onSubmit={resetMode ? handleResetPassword : handleLogin} className="space-y-6" aria-label={resetMode ? t('resetPassword') : t('signIn')}>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-green-600 dark:text-green-400 text-sm">
          {success}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
          {t('email')}
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            spellCheck={false}
            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
            placeholder={t('emailPlaceholder')}
          />
        </div>
      </div>

      {!resetMode && (
        <div>
          <label htmlFor="login-password" className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
            {t('password')}
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="current-password"
            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
            placeholder={t('passwordPlaceholder')}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        {!resetMode && (
          <button
            type="button"
            onClick={() => { setResetMode(true); setError(''); setSuccess(''); }}
            className="text-sm text-[#00D4FF] hover:underline py-2 px-1 min-h-[44px] inline-flex items-center"
          >
            {t('forgotPassword')}
          </button>
        )}
        {resetMode && (
          <button
            type="button"
            onClick={() => { setResetMode(false); setError(''); setSuccess(''); }}
            className="text-sm text-gray-500 dark:text-gray-400 hover:underline py-2 px-1 min-h-[44px] inline-flex items-center"
          >
            {t('backToLogin')}
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#00D4FF] text-white font-medium py-3 rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {resetMode ? t('sending') : t('signingIn')}
          </>
        ) : (
          resetMode ? t('sendResetLink') : t('signIn')
        )}
      </button>

      {!resetMode && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-zinc-800 text-gray-400 dark:text-gray-500">{t('or')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOAuth}
            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-gray-200 font-medium py-3 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-500 transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t('signInWithGoogle')}
          </button>
        </>
      )}
    </form>
  );
}
