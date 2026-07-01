import { client } from '@/lib/sanity.server';
import { notFound } from 'next/navigation';
import CaseStudyDetail from './CaseStudyDetail';
import type { Metadata } from 'next';

async function getCaseStudy(slug: string) {
  try {
    const query = `*[_type == "caseStudy" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      industry,
      clientName,
      summary,
      summaryZh,
      content,
      contentZh,
      productsUsed,
      results,
      coverImage
    }`;
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error('Failed to fetch case study:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);
  if (!caseStudy) return { title: 'Case Study Not Found' };
  return {
    title: caseStudy.title,
    description: caseStudy.summary
  };
}

export default async function CaseStudyDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const caseStudy = await getCaseStudy(slug);
  if (!caseStudy) notFound();
  return <CaseStudyDetail caseStudy={caseStudy} locale={locale} />;
}