import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import TableOfContents, { type TocSection } from '@/components/legal/TableOfContents';
import { SUPPORT_EMAIL } from '@/lib/config';
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
  const tLegal = await getTranslations('legal');
  const locale = await getLocale();

  // Dynamic last-updated date: prefer build-time injected env var so the
  // date stays in sync with the deployed build. Fallback to a known recent
  // date when the env var is not set (e.g. local dev, test runs).
  // NOTE: next.config.ts is owned by W4-7 — env var injection will be wired
  // there. Until then we fall back gracefully.
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || '2026-07-19';

  const sections: TocSection[] = [
    { id: 'section-1', title: t('section1Title') },
    { id: 'section-2', title: t('section2Title') },
    { id: 'section-3', title: t('section3Title') },
    { id: 'section-4', title: t('section4Title') },
    { id: 'section-5', title: t('section5Title') },
    { id: 'section-6', title: t('section6Title') },
    { id: 'section-7', title: t('section7Title') },
  ];

  return (
    <>
      <div className="print:hidden">
        <Breadcrumb items={[{ label: t('title') }]} />
      </div>
      <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto print:max-w-none print:py-0 print:px-0">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-12">
          <article className="max-w-4xl">
            <h1 className="section-title text-gray-900 dark:text-white mb-8 print:text-black">{t('title')}</h1>
            <div className="prose prose-gray max-w-none space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed text-base print:text-black">
              <p><strong>{t('lastUpdated')}:</strong> {buildDate}</p>

              <div>
                <h2 id="section-1" className="text-xl font-bold text-gray-900 dark:text-white mt-8 print:text-black">1. {t('section1Title')}</h2>
                <p>{t('section1Body')}</p>
              </div>

              <div>
                <h2 id="section-2" className="text-xl font-bold text-gray-900 dark:text-white mt-8 print:text-black">2. {t('section2Title')}</h2>
                <p>{t('section2Body')}</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  {(['section2Items'] as const).map((key) =>
                    t.raw(key).map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))
                  )}
                </ul>
              </div>

              <div>
                <h2 id="section-3" className="text-xl font-bold text-gray-900 dark:text-white mt-8 print:text-black">3. {t('section3Title')}</h2>
                <p>{t('section3Body')}</p>
              </div>

              <div>
                <h2 id="section-4" className="text-xl font-bold text-gray-900 dark:text-white mt-8 print:text-black">4. {t('section4Title')}</h2>
                <p>{t('section4Body')}</p>
              </div>

              <div>
                <h2 id="section-5" className="text-xl font-bold text-gray-900 dark:text-white mt-8 print:text-black">5. {t('section5Title')}</h2>
                <p>{t('section5Body')}</p>
              </div>

              <div>
                <h2 id="section-6" className="text-xl font-bold text-gray-900 dark:text-white mt-8 print:text-black">6. {t('section6Title')}</h2>
                <p>
                  {t('section6Body')}{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#00D4FF] hover:underline">
                    {SUPPORT_EMAIL}
                  </a>.
                </p>
              </div>

              <div>
                <h2 id="section-7" className="text-xl font-bold text-gray-900 dark:text-white mt-8 print:text-black">7. {t('section7Title')}</h2>
                <p>
                  {t('section7Body')}{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#00D4FF] hover:underline">
                    {SUPPORT_EMAIL}
                  </a>.
                </p>
              </div>
            </div>
            <div className="mt-12 print:hidden">
              <Link href={`/${locale}/home`} className="inline-flex items-center gap-2 py-2 px-1 text-[#00D4FF] hover:underline min-h-[44px]">
                {t('backHome')}
              </Link>
            </div>
          </article>

          <TableOfContents
            sections={sections}
            tocLabel={tLegal('toc')}
            printLabel={tLegal('print')}
          />
        </div>
      </section>
    </>
  );
}
