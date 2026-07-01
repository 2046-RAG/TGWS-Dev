import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');
  const locale = await getLocale();

  return (
    <section className="py-20 px-5 sm:px-8 max-w-4xl mx-auto">
      <h1 className="section-title text-gray-900 mb-8">{t('title')}</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
        <p><strong>{t('lastUpdated')}:</strong> June 30, 2026</p>

        <h2 className="text-xl font-bold text-gray-900 mt-8">1. {t('section1Title')}</h2>
        <p>{t('section1Body')}</p>

        <h2 className="text-xl font-bold text-gray-900 mt-8">2. {t('section2Title')}</h2>
        <p>{t('section2Body')}</p>
        <ul className="list-disc pl-6 space-y-2">
          {(['section2Items'] as const).map((key) =>
            t.raw(key).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))
          )}
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8">3. {t('section3Title')}</h2>
        <p>{t('section3Body')}</p>

        <h2 className="text-xl font-bold text-gray-900 mt-8">4. {t('section4Title')}</h2>
        <p>{t('section4Body')}</p>

        <h2 className="text-xl font-bold text-gray-900 mt-8">5. {t('section5Title')}</h2>
        <p>{t('section5Body')}</p>

        <h2 className="text-xl font-bold text-gray-900 mt-8">6. {t('section6Title')}</h2>
        <p>
          {t('section6Body')}{' '}
          <a href="mailto:info@techguru-it.asia" className="text-[#00D4FF] hover:underline">
            info@techguru-it.asia
          </a>.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8">7. {t('section7Title')}</h2>
        <p>
          {t('section7Body')}{' '}
          <a href="mailto:info@techguru-it.asia" className="text-[#00D4FF] hover:underline">
            info@techguru-it.asia
          </a>.
        </p>
      </div>
      <div className="mt-12">
        <Link href={`/${locale}/home`} className="text-[#00D4FF] hover:underline">
          {t('backHome')}
        </Link>
      </div>
    </section>
  );
}
