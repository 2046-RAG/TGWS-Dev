'use client';

import { useTranslations } from 'next-intl';
import { Check, X, Minus } from 'lucide-react';

type Category = 'all' | 'security' | 'networking' | 'cloud' | 'ai';

interface FeatureRow {
  key: string;
  category: Category[];
}

const features: FeatureRow[] = [
  { key: 'vmwareMigration', category: ['cloud'] },
  { key: 'managedSecurity', category: ['security'] },
  { key: 'aigcCapabilities', category: ['ai'] },
  { key: 'multiVendor', category: ['cloud', 'security', 'networking'] },
  { key: 'regionalSupport', category: ['all'] },
  { key: 'hybridCloud', category: ['cloud'] },
  { key: 'costModel', category: ['all'] },
];

export default function CompareTable({ activeCategory = 'all' }: { activeCategory?: Category }) {
  const t = useTranslations('compare');

  const filtered = activeCategory === 'all'
    ? features
    : features.filter((f) => f.category.includes(activeCategory) || f.category.includes('all'));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-zinc-700">
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white w-1/4">
              {t('table.feature')}
            </th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-white bg-[#00D4FF] rounded-t-xl w-1/4">
              {t('table.techguru')}
            </th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-zinc-700 w-1/4">
              {t('table.competitorA')}
            </th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-zinc-800 w-1/4">
              {t('table.competitorB')}
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((feature, index) => (
            <tr
              key={feature.key}
              className={`border-b border-gray-100 dark:border-zinc-700 ${index % 2 === 0 ? 'bg-white dark:bg-zinc-800' : 'bg-gray-50/50 dark:bg-zinc-700/50'}`}
            >
              <td className="py-4 px-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {t(`features.${feature.key}`)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t(`features.${feature.key}Desc`)}
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] text-sm font-medium">
                  <Check size={14} className="shrink-0" />
                  <span className="hidden sm:inline">{t(`features.${feature.key}Tg`)}</span>
                </span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-sm">
                  {t(`features.${feature.key}A`).includes('N/A') || t(`features.${feature.key}A`).includes('不') || t(`features.${feature.key}A`).includes('not') ? (
                    <X size={14} className="text-red-400 shrink-0" />
                  ) : (
                    <Minus size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                  )}
                  <span className="hidden sm:inline">{t(`features.${feature.key}A`)}</span>
                </span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-sm">
                  {t(`features.${feature.key}B`).includes('N/A') || t(`features.${feature.key}B`).includes('不') || t(`features.${feature.key}B`).includes('not') || t(`features.${feature.key}B`).includes('N/A') ? (
                    <X size={14} className="text-red-400 shrink-0" />
                  ) : (
                    <Minus size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                  )}
                  <span className="hidden sm:inline">{t(`features.${feature.key}B`)}</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
