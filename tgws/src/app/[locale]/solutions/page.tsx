'use client';

import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
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

const industries = [
  {
    key: 'healthcare',
    icon: Heart,
    color: '#00D4FF',
    accent: 'from-[#00D4FF]/10 to-[#00D4FF]/5',
    metricIcon: Heart,
    metricLabel: 'Patient Data Security',
  },
  {
    key: 'finance',
    icon: Building2,
    color: '#7B61FF',
    accent: 'from-[#7B61FF]/10 to-[#7B61FF]/5',
    metricIcon: Shield,
    metricLabel: 'Transaction Security',
  },
  {
    key: 'retail',
    icon: ShoppingCart,
    color: '#22C55E',
    accent: 'from-[#22C55E]/10 to-[#22C55E]/5',
    metricIcon: TrendingUp,
    metricLabel: 'Sales Performance',
  },
  {
    key: 'logistics',
    icon: Truck,
    color: '#F59E0B',
    accent: 'from-[#F59E0B]/10 to-[#F59E0B]/5',
    metricIcon: Clock,
    metricLabel: 'Delivery Efficiency',
  },
  {
    key: 'education',
    icon: GraduationCap,
    color: '#EC4899',
    accent: 'from-[#EC4899]/10 to-[#EC4899]/5',
    metricIcon: Users,
    metricLabel: 'Student Engagement',
  },
  {
    key: 'government',
    icon: Landmark,
    color: '#6366F1',
    accent: 'from-[#6366F1]/10 to-[#6366F1]/5',
    metricIcon: Lock,
    metricLabel: 'Data Compliance',
  },
];

export default function SolutionsPage() {
  const t = useTranslations('solutions');
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const initialIndex = useMemo(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      const idx = industries.findIndex((ind) => ind.key === tab);
      if (idx !== -1) return idx;
    }
    return 0;
  }, [searchParams]);

  const [active, setActive] = useState(initialIndex);

  const industry = industries[active];
  const MetricIcon = industry.metricIcon;

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="section-title text-gray-900">{t('title')}</h1>
        <p className="section-subtitle mx-auto">{t('subtitle')}</p>
      </div>

      {/* Industry Selector - Horizontal Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {industries.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <button
              key={ind.key}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${
                active === i
                  ? 'bg-[#00D4FF]/10 border-[#00D4FF]/40 shadow-md ring-1 ring-[#00D4FF]/20'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <Icon size={18} style={{ color: ind.color }} />
              <span className="text-sm font-medium text-gray-700">{t(`industries.${ind.key}.name`)}</span>
            </button>
          );
        })}
      </div>

      {/* Industry Content - Unique Layout per Industry */}
      <div
        key={active}
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-fade-up"
      >
        {/* Hero Banner with Industry-Specific Gradient */}
        <div className={`bg-gradient-to-r ${industry.accent} p-8 md:p-12`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${industry.color}20` }}>
              <industry.icon size={32} style={{ color: industry.color }} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
                {t(`industries.${industry.key}.name`)}
              </h2>
              <p className="text-gray-600 max-w-2xl" style={{ lineHeight: '1.7' }}>{t(`industries.${industry.key}.description`)}</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200">
              <MetricIcon size={20} style={{ color: industry.color }} />
              <span className="text-sm font-medium text-gray-700">{industry.metricLabel}</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Pain Points — red-tinged bg, diamond bullets */}
            <div className="bg-red-50/50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-sm rotate-45 bg-red-400 shrink-0" />
                {t('painPoints')}
              </h3>
              <ul className="space-y-3">
                {['0', '1', '2'].map((idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-sm rotate-45 bg-red-400 shrink-0" />
                    {t(`industries.${industry.key}.painPoints.${idx}`)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions — green-tinged bg, checkmark bullets */}
            <div className="bg-green-50/50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" />
                {t('ourSolutions')}
              </h3>
              <ul className="space-y-3">
                {['0', '1', '2'].map((idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </span>
                    {t(`industries.${industry.key}.solutions.${idx}`)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Featured Products — blue-tinged bg, card-style bullets */}
            <div className="bg-blue-50/50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 shrink-0" />
                {t('featuredProducts')}
              </h3>
              <div className="space-y-3">
                {['0', '1', '2'].map((idx) => (
                  <Link
                    key={idx}
                    href={`/${locale}/products`}
                    className="block bg-white border border-blue-100 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{t(`industries.${industry.key}.products.${idx}`)}</span>
                      <ArrowRight size={16} className="text-blue-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {t('ctaDesc') || 'Ready to transform your IT infrastructure?'}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00D4FF] text-white font-medium rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200 text-sm"
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
