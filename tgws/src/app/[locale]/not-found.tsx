import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function NotFoundPage() {
  const t = await getTranslations('error');
  const locale = await getLocale();

  return (
    <section className="min-h-[calc(100vh-73px)] flex items-center justify-center px-5">
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg w-full shadow-sm">
        <h1 className="text-7xl font-bold text-[#00D4FF] mb-6">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('notFound')}</h2>
        <p className="text-gray-600 mb-8">{t('notFoundDesc')}</p>
        <Link
          href={`/${locale}/home`}
          className="inline-block px-6 py-3 bg-[#00D4FF] text-white font-medium rounded-full hover:bg-[#00B8DB] transition-colors"
        >
          {t('backHome')}
        </Link>
      </div>
    </section>
  );
}
