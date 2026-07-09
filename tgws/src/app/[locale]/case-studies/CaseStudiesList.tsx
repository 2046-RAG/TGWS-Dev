'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building2, Users, TrendingUp, Clock, Target, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity.image';

const industries = ['all', 'healthcare', 'finance', 'retail', 'logistics', 'education', 'government', 'manufacturing', 'other'];

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

const ITEMS_PER_PAGE = 9;

interface CaseStudy {
  _id: string;
  title: string;
  titleZh?: string;
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
  const router = useRouter();
  const locale = params.locale as string;

  const initialIndustry = useMemo(() => {
    const filter = searchParams.get('filter');
    if (filter && industries.includes(filter)) return filter;
    return 'all';
  }, [searchParams]);

  const [activeIndustry, setActiveIndustry] = useState(initialIndustry);
  const [showAll, setShowAll] = useState(false);

  const filtered = activeIndustry === 'all' ? cases : cases.filter((c) => c.industry === activeIndustry);
  const featuredCase = filtered[0];
  const remainingCases = filtered.slice(1);
  const visibleCases = showAll ? remainingCases : remainingCases.slice(0, ITEMS_PER_PAGE);

  const handleIndustryChange = (ind: string) => {
    setActiveIndustry(ind);
    setShowAll(false);
    const url = new URL(window.location.href);
    if (ind === 'all') {
      url.searchParams.delete('filter');
    } else {
      url.searchParams.set('filter', ind);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  };

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="section-title text-gray-900">{t('title')}</h1>
        <p className="section-subtitle mx-auto">{t('subtitle')}</p>
      </div>

      {/* Industry Filter - Color Coded + URL Synced */}
      <div className="flex flex-wrap justify-center gap-2 mb-14">
        {industries.map((ind) => {
          const color = industryColors[ind] || '#6B7280';
          const isActive = activeIndustry === ind;
          return (
            <button
              key={ind}
              onClick={() => handleIndustryChange(ind)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 border ${
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              style={isActive ? { backgroundColor: color, borderColor: color } : undefined}
            >
              {t(`filters.industry.${ind}`)}
            </button>
          );
        })}
      </div>

      {/* Featured Case Study - Full Width Hero */}
      {featuredCase && (
        <div className="mb-16 scroll-reveal">
          <Link href={`/${locale}/case-studies/${featuredCase.slug?.current}`}>
            <article className="relative rounded-2xl overflow-hidden group cursor-pointer min-h-[420px] md:min-h-[460px] flex items-end">
              <div className="absolute inset-0">
                {featuredCase.coverImage ? (
                  <Image
                    src={typeof featuredCase.coverImage === 'string' && featuredCase.coverImage.startsWith('http')
                      ? featuredCase.coverImage
                      : urlFor(featuredCase.coverImage).width(1200).height(600).url()}
                    alt={featuredCase.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Building2 size={80} className="text-white/10" />
                  </div>
                )}
                <div
                  className="absolute inset-0 opacity-40"
                  style={{ background: `linear-gradient(135deg, ${industryColors[featuredCase.industry] || '#6B7280'}80, transparent)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              </div>

              <div className="relative z-10 p-8 md:p-12 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: industryColors[featuredCase.industry] || '#6B7280' }}
                  >
                    {t(`filters.industry.${featuredCase.industry}`)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-white/60">
                    <Building2 size={12} />
                    {featuredCase.clientName}
                  </span>
                </div>

                <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 max-w-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  {locale === 'zh' ? (featuredCase.titleZh || featuredCase.title) : featuredCase.title}
                </h2>

                <p className="text-white/70 mb-6 max-w-2xl line-clamp-2 leading-relaxed">
                  {locale === 'zh' ? (featuredCase.summaryZh || featuredCase.summary) : featuredCase.summary}
                </p>

                {/* Products Used */}
                {featuredCase.productsUsed && featuredCase.productsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredCase.productsUsed.slice(0, 3).map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all">
                  {t('readMore')}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          </Link>
        </div>
      )}

      {/* Remaining Case Studies - Industry Accent Cards */}
      {visibleCases.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCases.map((cs, index) => {
            const color = industryColors[cs.industry] || '#6B7280';
            return (
              <div
                key={cs._id}
                className="scroll-reveal"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <Link href={`/${locale}/case-studies/${cs.slug?.current}`}>
                  <article className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full">
                    <div className="relative h-44">
                      {cs.coverImage ? (
                        <Image
                          src={typeof cs.coverImage === 'string' && cs.coverImage.startsWith('http')
                            ? cs.coverImage
                            : urlFor(cs.coverImage).width(600).height(300).url()}
                          alt={cs.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                          decoding="async"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Building2 size={40} className="text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: color }}>
                          {t(`filters.industry.${cs.industry}`)}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 size={13} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">{cs.clientName}</span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#00D4FF] transition-colors duration-200">
                        {locale === 'zh' ? (cs.titleZh || cs.title) : cs.title}
                      </h3>

                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
                        {locale === 'zh' ? (cs.summaryZh || cs.summary) : cs.summary}
                      </p>

                      {/* Products Used */}
                      {cs.productsUsed && cs.productsUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {cs.productsUsed.slice(0, 2).map((tech, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                              {tech}
                            </span>
                          ))}
                          {cs.productsUsed.length > 2 && (
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-400">
                              +{cs.productsUsed.length - 2}
                            </span>
                          )}
                        </div>
                      )}

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
            );
          })}
        </div>
      )}

      {/* Load More */}
      {remainingCases.length > ITEMS_PER_PAGE && !showAll && (
        <div className="text-center mt-10">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors min-h-[44px]"
          >
            {t('loadMore')}
            <ChevronDown size={16} />
            <span className="text-xs text-gray-400">
              ({t('showing')} {ITEMS_PER_PAGE}/{remainingCases.length})
            </span>
          </button>
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
