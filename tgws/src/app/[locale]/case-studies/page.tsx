import { client } from '@/lib/sanity';
import CaseStudiesList from './CaseStudiesList';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'caseStudies.metadata' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

async function getCaseStudies() {
  try {
    const query = `*[_type == "caseStudy"] | order(industry asc) {
      _id,
      title,
      titleZh,
      slug,
      industry,
      clientName,
      summary,
      summaryZh,
      productsUsed,
      coverImage
    }`;
    const cases = await client.fetch(query);
    return cases || [];
  } catch (error) {
    console.error('Failed to fetch case studies:', error);
    return [];
  }
}

export default async function CaseStudiesPage() {
  const cases = await getCaseStudies();
  return (
    <>
      <Breadcrumb items={[{ label: 'Case Studies' }]} />
      <CaseStudiesList cases={cases} />
    </>
  );
}