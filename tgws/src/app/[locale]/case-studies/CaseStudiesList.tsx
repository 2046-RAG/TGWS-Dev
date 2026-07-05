'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building2, Users, TrendingUp } from 'lucide-react';
import Image from 'next/image';
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
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const initialIndustry = useMemo(() => {
    const filter = searchParams.get('filter');
    if (filter && industries.includes(filter)) return filter;
    return 'all';
  }, [searchParams]);

  const [activeIndustry, setActiveIndustry] = useState(initialIndustry);

  const filtered = activeIndustry === 'all' ? cases : cases.filter((c) => c.industry === activeIndustry);
  const featuredCase = filtered[0];
  const remainingCases = filtered.slice(1);

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
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${
              activeIndustry === ind
                ? 'bg-[#00D4FF] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {t(`filters.industry.${ind}`)}
          </button>
        ))}
      </div>

      {/* Featured Case Study - Large Layout */}
      {featuredCase && (
        <div className="mb-12 scroll-reveal">
          <Link href={`/${locale}/case-studies/${featuredCase.slug?.current}`}>
            <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:shadow-xl transition-all cursor-pointer">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative h-64 md:h-full min-h-[300px]">
                  {featuredCase.coverImage ? (
                    <Image
                      src={typeof featuredCase.coverImage === 'string' && featuredCase.coverImage.startsWith('http')
                        ? featuredCase.coverImage
                        : urlFor(featuredCase.coverImage).width(800).height(600).url()}
                      alt={featuredCase.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7B61FF]/20 flex items-center justify-center">
                      <Building2 size={64} className="text-[#00D4FF]/30" />
                    </div>
                  )}
                  {/* Industry Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-[#00D4FF] text-white shadow-lg">
                      {featuredCase.industry}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">{featuredCase.clientName}</span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-[#00D4FF] transition-colors duration-200">
                    {featuredCase.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed" style={{ lineHeight: '1.7' }}>
                    {locale === 'zh' ? (featuredCase.summaryZh || featuredCase.summary) : featuredCase.summary}
                  </p>

                  {/* Metrics Preview */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <Users size={20} className="mx-auto mb-1 text-[#00D4FF]" />
                      <div className="text-xs text-gray-500">{t('metrics.team')}</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp size={20} className="mx-auto mb-1 text-[#00D4FF]" />
                      <div className="text-xs text-gray-500">{t('metrics.results')}</div>
                    </div>
                    <div className="text-center">
                      <Building2 size={20} className="mx-auto mb-1 text-[#00D4FF]" />
                      <div className="text-xs text-gray-500">{t('metrics.duration')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#00D4FF] font-semibold group-hover:gap-4 transition-all">
                    {t('readMore')}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </div>
      )}

      {/* Remaining Case Studies - Compact Grid */}
      {remainingCases.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {remainingCases.map((cs, index) => (
            <div
              key={cs._id}
              className="scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link href={`/${locale}/case-studies/${cs.slug?.current}`}>
                <article className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  {/* Compact Image */}
                  <div className="relative h-40">
                    {cs.coverImage ? (
                      <Image
                        src={typeof cs.coverImage === 'string' && cs.coverImage.startsWith('http')
                          ? cs.coverImage
                          : urlFor(cs.coverImage).width(400).height(200).url()}
                        alt={cs.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#00D4FF]/10 to-[#7B61FF]/10 flex items-center justify-center">
                        <Building2 size={32} className="text-gray-300" />
                      </div>
                    )}
                    {/* Industry Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
                        {cs.industry}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">{cs.clientName}</span>
                    </div>
                    
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#00D4FF] transition-colors duration-200">
                      {cs.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                      {locale === 'zh' ? (cs.summaryZh || cs.summary) : cs.summary}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1.5 text-sm text-[#00D4FF] font-medium group-hover:gap-2.5 transition-all">
                        {t('readMore')}
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">{t('noResults')}</p>
        </div>
      )}
    </section>
  );
}