import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy.metadata' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');
  const locale = await getLocale();

  return (
    <>
      <Breadcrumb items={[{ label: t('title') }]} locale={locale} />
      <section className="py-20 px-5 sm:px-8 max-w-4xl mx-auto">
        <h1 className="section-title text-gray-900 dark:text-white mb-8">{t('title')}</h1>
        
        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed text-base">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <strong>{t('lastUpdated')}:</strong> July 1, 2026
          </p>

          <p>{t('intro')}</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section1Title')}</h2>
          <p>{t('section1Body')}</p>
          <ul className="list-disc pl-6 space-y-2">
            {t.raw('section1Items').map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section2Title')}</h2>
          <p>{t('section2Body')}</p>
          <ul className="list-disc pl-6 space-y-2">
            {t.raw('section2Items').map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section3Title')}</h2>
          <p>{t('section3Body')}</p>
          <ul className="list-disc pl-6 space-y-2">
            {t.raw('section3Items').map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section4Title')}</h2>
          <p>{t('section4Body')}</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section5Title')}</h2>
          <p>{t('section5Body')}</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section6Title')}</h2>
          <p>{t('section6Body')}</p>
          <ul className="list-disc pl-6 space-y-2">
            {t.raw('section6Items').map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section7Title')}</h2>
          <p>{t('section7Body')}</p>
          <ul className="list-disc pl-6 space-y-2">
            {t.raw('section7Items').map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section8Title')}</h2>
          <p>{t('section8Body')}</p>
          <ul className="list-disc pl-6 space-y-2">
            {t.raw('section8Items').map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section9Title')}</h2>
          <p>{t('section9Body')}</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section10Title')}</h2>
          <p>{t('section10Body')}</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section11Title')}</h2>
          <p>{t('section11Body')}</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">{t('section12Title')}</h2>
          <p>{t('section12Body')}</p>
          <ul className="list-disc pl-6 space-y-2">
            {t.raw('section12Items').map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <Link 
            href={`/${locale}/home`} 
            className="inline-flex items-center gap-2 py-2 px-1 text-[#00D4FF] hover:underline min-h-[44px]"
          >
            {t('backHome')}
          </Link>
        </div>
      </section>
    </>
  );
}