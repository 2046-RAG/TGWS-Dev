import { client } from '@/lib/sanity';
import CaseStudiesList from './CaseStudiesList';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Case Studies',
  description: 'Real-world success stories from TechGuru clients across healthcare, finance, retail, logistics, education, and government sectors.',
  openGraph: {
    title: 'Case Studies | TechGuru',
    description: 'Real-world success stories from TechGuru clients across healthcare, finance, retail, logistics, education, and government sectors.',
  },
};

async function getCaseStudies() {
  try {
    const query = `*[_type == "caseStudy"] | order(industry asc) {
      _id,
      title,
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