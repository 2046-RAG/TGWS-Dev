'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { urlFor } from '@/lib/sanity.image';

const industries = ['all', 'healthcare', 'finance', 'retail', 'logistics', 'education', 'government', 'manufacturing', 'other'];

interface CaseStudy {
  _id: string;
  title: string;
  slug: { current: string };
  industry: string;
  clientName: string;
  summary: string;
  summaryZh: string;
  productsUsed: string[];
  coverImage: string;
}

export default function CaseStudiesList({ cases }: { cases: CaseStudy[] }) {
  const t = useTranslations('caseStudies');
  const params = useParams();
  const locale = params.locale as string;
  const [activeIndustry, setActiveIndustry] = useState('all');

  const filtered = activeIndustry === 'all' ? cases : cases.filter((c) => c.industry === activeIndustry);

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="section-title text-gray-900">{t('title')}</h1>
        <p className="section-subtitle mx-auto">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {industries.map((ind) => (
          <button
            key={ind}
            onClick={() => setActiveIndustry(ind)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeIndustry === ind
                ? 'bg-[#00D4FF] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {t(`filters.industry.${ind}`)}
          </button>
        ))}
      </div>

      <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((cs) => (
          <Link key={cs._id} href={`/${locale}/case-studies/${cs.slug?.current}`}>
            <motion.article
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer h-full"
            >
              {cs.coverImage ? (
                <img 
                  src={typeof cs.coverImage === 'string' && cs.coverImage.startsWith('http') 
                    ? cs.coverImage 
                    : urlFor(cs.coverImage).width(600).height(300).url()} 
                  alt={cs.title} 
                  className="h-44 w-full object-cover" 
                />
              ) : (
                <div className="h-44 bg-[#00D4FF]/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-200">{cs.clientName?.charAt(0) || 'C'}</span>
                </div>
              )}
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-[#00D4FF]/10 text-[#00D4FF]">
                    {cs.industry}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{cs.title}</h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {locale === 'zh' ? (cs.summaryZh || cs.summary) : cs.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{cs.clientName}</span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#00D4FF] group-hover:gap-2.5 transition-all">
                    {t('readMore')}
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </motion.article>
          </Link>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          {t('noResults')}
        </div>
      )}
    </section>
  );
}