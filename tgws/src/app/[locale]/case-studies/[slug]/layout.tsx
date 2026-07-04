import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

const slugToI18nKey: Record<string, string> = {
  'hospital-cloud-migration': '1',
  'banking-zero-trust': '2',
  'retail-ai-forecasting': '3',
  'logistics-network-upgrade': '4',
  'university-elearning': '5',
  'government-modernization': '6',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const caseKey = slugToI18nKey[slug];

  if (!caseKey) {
    return {
      title: 'Case Study Not Found | TechGuru',
    };
  }

  const t = await getTranslations({ locale, namespace: 'caseStudies.detail' });
  const title = t(`cases.${caseKey}.title`);

  return {
    title: `${title} | TechGuru Case Studies`,
    description: t('ctaDesc'),
    openGraph: {
      title: `${title} | TechGuru Case Studies`,
      description: t('ctaDesc'),
      type: 'article',
    },
  };
}

export default function CaseStudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
