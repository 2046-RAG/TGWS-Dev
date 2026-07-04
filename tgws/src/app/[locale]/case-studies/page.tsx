import { client } from '@/lib/sanity';
import CaseStudiesList from './CaseStudiesList';

export const revalidate = 3600;

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
  return <CaseStudiesList cases={cases} />;
}