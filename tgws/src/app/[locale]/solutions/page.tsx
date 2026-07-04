'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Heart,
  Building2,
  ShoppingCart,
  Truck,
  GraduationCap,
  Landmark,
  ArrowRight,
} from 'lucide-react';

const industries = [
  { key: 'healthcare', icon: Heart, color: '#00D4FF' },
  { key: 'finance', icon: Building2, color: '#7B61FF' },
  { key: 'retail', icon: ShoppingCart, color: '#00D4FF' },
  { key: 'logistics', icon: Truck, color: '#7B61FF' },
  { key: 'education', icon: GraduationCap, color: '#00D4FF' },
  { key: 'government', icon: Landmark, color: '#7B61FF' },
];

export default function SolutionsPage() {
  const t = useTranslations('solutions');
  const params = useParams();
  const locale = params.locale as string;
  const [active, setActive] = useState(0);

  const industry = industries[active];

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="section-title text-gray-900">{t('title')}</h1>
        <p className="section-subtitle mx-auto">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
        {industries.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <button
              key={ind.key}
              onClick={() => setActive(i)}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300 ${
                active === i
                  ? 'bg-white border-gray-300 shadow-lg'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon size={28} style={{ color: ind.color }} />
              <span className="text-sm font-medium text-gray-700">{t(`industries.${ind.key}.name`)}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm"
      >
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t(`industries.${industry.key}.name`)}
            </h2>
            <p className="text-gray-600 mb-6">{t(`industries.${industry.key}.description`)}</p>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                {t('painPoints')}
              </h3>
              <ul className="space-y-2">
                {['0', '1', '2'].map((idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: industry.color }} />
                    {t(`industries.${industry.key}.painPoints.${idx}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                {t('ourSolutions')}
              </h3>
              <ul className="space-y-2">
                {['0', '1', '2'].map((idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: industry.color }} />
                    {t(`industries.${industry.key}.solutions.${idx}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                {t('featuredProducts')}
              </h3>
              <div className="space-y-3">
                {['0', '1', '2'].map((idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">{t(`industries.${industry.key}.products.${idx}`)}</span>
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
            <Link
              href={`/${locale}/contact`}
              className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] text-white font-medium rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              {t('cta')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
