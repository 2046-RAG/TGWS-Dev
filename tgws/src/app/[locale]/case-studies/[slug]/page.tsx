import { client } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import CaseStudyDetail from './CaseStudyDetail';
import type { Metadata } from 'next';

export const revalidate = 3600;

async function getCaseStudy(slug: string) {
  try {
    const query = `*[_type == "caseStudy" && slug.current == $slug][0] {
      _id,
      title,
      titleZh,
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const caseStudy = await getCaseStudy(slug);
  if (!caseStudy) return { title: 'Case Study Not Found' };
  const title = locale === 'zh' ? (caseStudy.titleZh || caseStudy.title) : caseStudy.title;
  return {
    title,
    description: locale === 'zh' ? (caseStudy.summaryZh || caseStudy.summary) : caseStudy.summary
  };
}

export default async function CaseStudyDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const caseStudy = await getCaseStudy(slug);
  if (!caseStudy) notFound();
  return <CaseStudyDetail caseStudy={caseStudy} locale={locale} />;
}