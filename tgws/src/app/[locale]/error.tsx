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
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg w-full shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('title')}</h1>
        <p className="text-gray-600 mb-8">{t('description')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#00D4FF] text-white font-medium rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
          >
            {t('retry')}
          </button>
          <Link
            href={`/${locale}/home`}
            className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
          >
            {t('goHome')}
          </Link>
        </div>
      </div>
    </section>
  );
}
