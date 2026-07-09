import { client } from '@/lib/sanity';
import SolutionsList from './SolutionsList';
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
  const t = await getTranslations({ locale, namespace: 'solutions.metadata' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

async function getSolutions() {
  try {
    const query = `*[_type == "solution"] | order(industry asc) {
      _id,
      title,
      slug,
      industry,
      description,
      descriptionZh,
      challenges,
      recommendedProducts,
      image
    }`;
    const solutions = await client.fetch(query);
    return solutions || [];
  } catch (error) {
    console.error('Failed to fetch solutions:', error);
    return [];
  }
}

export default async function SolutionsPage() {
  const solutions = await getSolutions();
  return (
    <>
      <Breadcrumb items={[{ label: 'Solutions' }]} />
      <SolutionsList solutions={solutions} />
    </>
  );
}
