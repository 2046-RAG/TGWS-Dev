'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity.image';

const industryColors: Record<string, string> = {
  healthcare: '#EF4444',
  finance: '#3B82F6',
  retail: '#F59E0B',
  logistics: '#8B5CF6',
  education: '#10B981',
  government: '#6366F1',
  manufacturing: '#EC4899',
  other: '#6B7280',
};

interface PortableTextBlock {
  _type: string;
  children?: { _type: string; text: string }[];
}

interface CaseStudy {
  _id: string;
  title: string;
  slug: { current: string };
  industry: string;
  clientName: string;
  summary: string;
  summaryZh: string;
  content: PortableTextBlock[];
  contentZh: PortableTextBlock[];
  productsUsed: string[];
  results: string[];
  coverImage: string;
}

function PortableText({ content }: { content: PortableTextBlock[] }) {
  if (!content || !Array.isArray(content)) return null;
  return (
    <div className="space-y-4">
      {content.map((block, i) => {
        if (block._type === 'block') {
          const text = block.children?.map((c) => c.text).join('') || '';
          return <p key={i} className="text-gray-600 leading-relaxed">{text}</p>;
        }
        return null;
      })}
    </div>
  );
}

export default function CaseStudyDetail({ caseStudy, locale }: { caseStudy: CaseStudy; locale: string }) {
  const t = useTranslations('caseStudies.detail');
  const tFilters = useTranslations('caseStudies.filters.industry');
  const color = industryColors[caseStudy.industry] || '#6B7280';

  return (
    <section className="py-20 px-5 sm:px-8 max-w-5xl mx-auto">
      <div className="scroll-reveal">
        <Link href={`/${locale}/case-studies`} className="inline-flex items-center gap-2 py-2 px-1 text-gray-600 hover:text-gray-900 min-h-[44px] mb-8 transition-colors">
          <ArrowLeft size={16} />
          {t('backToCases')}
        </Link>

        {caseStudy.coverImage && (
          <Image
            src={typeof caseStudy.coverImage === 'string' && caseStudy.coverImage.startsWith('http')
              ? caseStudy.coverImage
              : urlFor(caseStudy.coverImage).width(1200).height(600).url()}
            alt={caseStudy.title}
            width={1200}
            height={600}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="w-full h-64 sm:h-96 object-cover rounded-2xl mb-8"
          />
        )}

        <div className="bg-[#00D4FF]/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className="px-3 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {tFilters(caseStudy.industry)}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{caseStudy.title}</h1>
          <p className="text-gray-600">{caseStudy.clientName}</p>
        </div>

        <div className="mb-8">
          <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-4">
            {t('summary')}
          </h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-gray-600 leading-relaxed">
              {locale === 'zh' ? (caseStudy.summaryZh || caseStudy.summary) : caseStudy.summary}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
              <Lightbulb size={16} className="text-blue-500" />
            </span>
            {t('solution')}
          </h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <PortableText content={locale === 'zh' ? (caseStudy.contentZh || caseStudy.content) : caseStudy.content} />
          </div>
        </div>

        {caseStudy.results && caseStudy.results.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                <CheckCircle size={16} className="text-green-500" />
              </span>
              {t('results')}
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <ul className="space-y-3">
                {caseStudy.results.map((result: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {caseStudy.productsUsed && caseStudy.productsUsed.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('technologies')}</h2>
            <div className="flex flex-wrap gap-2">
              {caseStudy.productsUsed.map((tech: string, index: number) => (
                <span key={index} className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#00D4FF]/5 border border-gray-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cta')}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('ctaDesc')}</p>
          <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00D4FF] text-white font-medium hover:bg-[#00B8DB] transition-colors">
            {t('ctaBtn')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}