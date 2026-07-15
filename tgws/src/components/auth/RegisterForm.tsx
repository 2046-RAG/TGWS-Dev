'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Mail, Lock, User, Loader2, CheckCircle } from 'lucide-react';

export default function RegisterForm() {
  const t = useTranslations('auth');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const params = useParams();
  const locale = params.locale as string;
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t('passwordMinLength'));
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError(t('passwordRequirements'));
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setRegistered(true);
    }
    setLoading(false);
  };

  if (registered) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('checkEmail')}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('verificationSent')} <span className="font-medium text-gray-900 dark:text-white">{email}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('noEmail')}{' '}
          <button
            onClick={async () => {
              await supabase.auth.resend({ email, type: 'signup' });
            }}
            className="text-[#00D4FF] hover:underline"
          >
            {t('resendEmail')}
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-6" aria-label={t('createAccount')}>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="register-name" className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
          {t('fullName')}
        </label>
        <div className="relative">
          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id="register-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
            placeholder={t('fullNamePlaceholder')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
          {t('email')}
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id="register-email"
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

      <div>
        <label htmlFor="register-password" className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
          {t('password')}
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id="register-password"
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
      </div>

      <div>
        <label htmlFor="register-confirm" className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
          {t('confirmPassword')}
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id="register-confirm"
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
            {t('creatingAccount')}
          </>
        ) : (
          t('createAccount')
        )}
      </button>
    </form>
  );
}
