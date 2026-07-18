'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Building2,
  ShoppingCart,
  Truck,
  GraduationCap,
  Landmark,
  ArrowRight,
  Shield,
  Clock,
  TrendingUp,
  Users,
  Lock,
} from 'lucide-react';

const industryMeta: Record<string, {
  icon: typeof Heart;
  color: string;
  accent: string;
  metricIcon: typeof Heart;
}> = {
  healthcare: { icon: Heart, color: '#00D4FF', accent: 'from-[#00D4FF]/10 to-[#00D4FF]/5', metricIcon: Heart },
  finance: { icon: Building2, color: '#7B61FF', accent: 'from-[#7B61FF]/10 to-[#7B61FF]/5', metricIcon: Shield },
  retail: { icon: ShoppingCart, color: '#22C55E', accent: 'from-[#22C55E]/10 to-[#22C55E]/5', metricIcon: TrendingUp },
  logistics: { icon: Truck, color: '#F59E0B', accent: 'from-[#F59E0B]/10 to-[#F59E0B]/5', metricIcon: Clock },
  education: { icon: GraduationCap, color: '#EC4899', accent: 'from-[#EC4899]/10 to-[#EC4899]/5', metricIcon: Users },
  government: { icon: Landmark, color: '#6366F1', accent: 'from-[#6366F1]/10 to-[#6366F1]/5', metricIcon: Lock },
};

const industryKeys = ['healthcare', 'finance', 'retail', 'logistics', 'education', 'government'];

interface SanitySolution {
  _id: string;
  title?: string;
  slug?: string;
  industry?: string;
  description?: string;
  descriptionZh?: string;
  challenges?: string[];
  challengesZh?: string[];
  solutions?: string[];
  solutionsZh?: string[];
  recommendedProducts?: string[];
  recommendedProductsZh?: string[];
  metricLabel?: string;
  metricLabelZh?: string;
}

interface SolutionsListProps {
  solutions: SanitySolution[];
}

export default function SolutionsList({ solutions }: SolutionsListProps) {
  const t = useTranslations('solutions');
  const params = useParams();
  const locale = params.locale as string;
  const [active, setActive] = useState(0);

  const industryKey = industryKeys[active];
  const meta = industryMeta[industryKey] || industryMeta.healthcare;
  const MetricIcon = meta.metricIcon;
  const Icon = meta.icon;
  const isZh = locale === 'zh';

  // Find Sanity data for current industry
  const sanityData = solutions.find(s => s.industry === industryKey);

  // Resolve content: zh uses Sanity (Chinese), en uses i18n (English)
  const name = isZh
    ? (sanityData?.title || t(`industries.${industryKey}.name`))
    : t(`industries.${industryKey}.name`);
  const description = isZh
    ? (sanityData?.descriptionZh || sanityData?.description || t(`industries.${industryKey}.description`))
    : t(`industries.${industryKey}.description`);
  const metricLabel = isZh
    ? (sanityData?.metricLabelZh || sanityData?.metricLabel || t(`metricLabels.${industryKey}`))
    : t(`metricLabels.${industryKey}`);

  const painPoints = isZh
    ? (sanityData?.challengesZh?.length ? sanityData.challengesZh : null)
    : null;
  const solutionsList = isZh
    ? (sanityData?.solutionsZh?.length ? sanityData.solutionsZh : null)
    : null;
  const products = isZh
    ? (sanityData?.recommendedProductsZh?.length ? sanityData.recommendedProductsZh : null)
    : null;

  // i18n fallback data for en locale
  const i18nPainPoints = t.raw(`industries.${industryKey}.painPoints`);
  const i18nSolutions = t.raw(`industries.${industryKey}.solutions`);
  const i18nProducts = t.raw(`industries.${industryKey}.products`);

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="section-title text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="section-subtitle mx-auto">{t('subtitle')}</p>
      </div>

      {/* Industry Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {industryKeys.map((key, i) => {
          const m = industryMeta[key];
          const Icon = m.icon;
          return (
            <button
              key={key}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${
                active === i
                  ? 'bg-[#00D4FF]/10 border-[#00D4FF]/40 shadow-md ring-1 ring-[#00D4FF]/20'
                  : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-sm'
              }`}
            >
              <Icon size={18} style={{ color: m.color }} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t(`industries.${key}.name`)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Industry Content */}
      <div
        key={active}
        className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-sm animate-fade-up"
      >
        <div className={`bg-gradient-to-r ${meta.accent} p-8 md:p-12`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${meta.color}20` }}>
              <Icon size={32} style={{ color: meta.color }} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
                {name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl" style={{ lineHeight: '1.7' }}>{description}</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-700 rounded-xl border border-gray-200 dark:border-zinc-600">
              <MetricIcon size={20} style={{ color: meta.color }} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{metricLabel}</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* Architecture Diagram */}
          <div className="mb-8 bg-gray-50 dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
              {t('architectureDiagram')}
            </h3>
            <div className="flex justify-center">
              {industryKey === 'healthcare' && (
                <img src="/images/solutions/healthcare-network.svg" alt={t('architectures.healthcare')} className="max-w-full h-auto" />
              )}
              {industryKey === 'finance' && (
                <img src="/images/solutions/finance-security.svg" alt={t('architectures.finance')} className="max-w-full h-auto" />
              )}
              {industryKey === 'retail' && (
                <img src="/images/solutions/retail-network.svg" alt={t('architectures.retail')} className="max-w-full h-auto" />
              )}
              {industryKey === 'logistics' && (
                <img src="/images/solutions/logistics-network.svg" alt={t('architectures.logistics')} className="max-w-full h-auto" />
              )}
              {industryKey === 'education' && (
                <img src="/images/solutions/education-network.svg" alt={t('architectures.education')} className="max-w-full h-auto" />
              )}
              {industryKey === 'government' && (
                <img src="/images/solutions/government-network.svg" alt={t('architectures.government')} className="max-w-full h-auto" />
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pain Points */}
            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-sm rotate-45 bg-red-400 shrink-0" />
                {t('painPoints')}
              </h3>
              <ul className="space-y-3">
                {(painPoints || i18nPainPoints || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-sm rotate-45 bg-red-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" />
                {t('ourSolutions')}
              </h3>
              <ul className="space-y-3">
                {(solutionsList || i18nSolutions || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Featured Products */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 shrink-0" />
                {t('featuredProducts')}
              </h3>
              <div className="space-y-3">
                {(products || i18nProducts || []).map((item: string, idx: number) => (
                  <Link
                    key={idx}
                    href={`/${locale}/products`}
                    className="block bg-white dark:bg-zinc-700 border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-3 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {item}
                      </span>
                      <ArrowRight size={16} className="text-blue-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('ctaDesc')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              {t('cta')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
