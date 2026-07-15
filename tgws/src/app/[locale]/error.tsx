'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  const t = useTranslations('error');
  const locale = useLocale();

  return (
    <section className="min-h-[calc(100vh-73px)] flex items-center justify-center px-5">
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-12 text-center max-w-lg w-full shadow-sm">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{t('description')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#00D4FF] text-white font-medium rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
          >
            {t('retry')}
          </button>
          <Link
            href={`/${locale}/home`}
            className="px-6 py-3 border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-gray-200 font-medium rounded-full hover:bg-gray-50 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-500 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
          >
            {t('goHome')}
          </Link>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">{t('supportHint')}</p>
      </div>
    </section>
  );
}
