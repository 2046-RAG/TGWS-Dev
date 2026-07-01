import type { Metadata } from 'next';

const slugToTitle: Record<string, string> = {
  'hospital-cloud-migration': 'Regional Hospital Network Cloud Migration',
  'banking-zero-trust': 'Banking Group Zero Trust Transformation',
  'retail-ai-forecasting': 'Retail Chain AI Demand Forecasting',
  'logistics-network-upgrade': 'Logistics Firm Global Network Upgrade',
  'university-elearning': 'University E-Learning Platform Scale-Up',
  'government-modernization': 'Government Agency Legacy Modernization',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = slugToTitle[slug];

  if (!title) {
    return {
      title: 'Case Study Not Found | TechGuru',
    };
  }

  return {
    title: `${title} | TechGuru Case Studies`,
    description: `Learn how TechGuru helped solve challenges in this ${title} case study.`,
    openGraph: {
      title: `${title} | TechGuru Case Studies`,
      description: `Learn how TechGuru helped solve challenges in this ${title} case study.`,
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
