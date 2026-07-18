import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { locales } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'vmware.metadata' });
  const path = 'vmware-alternative';
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `/${l}/${path}`;
  }
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/${path}`,
      languages,
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

export default function VMwareAlternativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
