import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function NotFoundPage() {
  const t = await getTranslations('error');
  const locale = await getLocale();

  const quickLinks = [
    { label: t('suggestedHome'), href: `/${locale}/home` },
    { label: t('suggestedProducts'), href: `/${locale}/products` },
    { label: t('suggestedContact'), href: `/${locale}/contact` },
    { label: t('suggestedSupport'), href: `/${locale}/support` },
  ];

  return (
    <section className="min-h-[calc(100vh-73px)] flex items-center justify-center px-5">
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-12 text-center max-w-lg w-full shadow-sm">
        <h1 className="text-7xl font-bold text-[#00D4FF] mb-6">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('notFound')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{t('notFoundDesc')}</p>
        <Link
          href={`/${locale}/home`}
          className="inline-block px-6 py-3 bg-[#00D4FF] text-white font-medium rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 mb-8"
        >
          {t('backHome')}
        </Link>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('suggestedLinks')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-600 rounded-lg hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
