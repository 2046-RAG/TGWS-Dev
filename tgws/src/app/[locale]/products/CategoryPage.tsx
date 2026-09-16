'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { slugToI18n, ProductIcon, tabColors, runSubgroups, type TabKey } from './shared';
import { Code2, Server, Shield, ArrowRight, RefreshCw } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  subcategory?: string;
  order: number;
  description: string;
  descriptionZh: string;
  features: string[];
}

const categoryIcons: Record<TabKey, React.ReactNode> = {
  build: <Code2 size={24} />,
  run: <Server size={24} />,
  protect: <Shield size={24} />,
};

export default function CategoryPage({
  category,
  products,
}: {
  category: TabKey;
  products: Product[];
}) {
  const t = useTranslations('products');
  const params = useParams();
  const locale = params.locale as string;
  const color = tabColors[category];
  const filtered = products.filter(p => p.category === category);

  // Group products by subcategory for Run tab
  const groupedRun: { key: string; i18nKey: string; slugs: string[]; products: Product[] }[] = [];
  if (category === 'run') {
    for (const group of runSubgroups) {
      const slugSet = new Set(group.slugs);
      const groupProducts = filtered.filter(p => slugSet.has(p.slug?.current));
      if (groupProducts.length > 0) {
        groupedRun.push({ ...group, products: groupProducts });
      }
    }
  }

  const renderProductCard = (product: Product, index: number) => {
    const slug = product.slug?.current || '';
    const i18nKey = slugToI18n[slug] || '';
    const features = slug ? t.raw('features.' + slug) : null;

    return (
      <motion.div
        key={product._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link
          href={`/${locale}/products/${slug}`}
          className="group block bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200 h-full"
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: color + '15', color }}
          >
            <ProductIcon slug={slug} size={28} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#00D4FF] transition-colors duration-200">
            {t(i18nKey || product.title)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4" style={{ lineHeight: '1.7' }}>
            {Array.isArray(features) ? features.join(' • ') : (product.features?.join(' • ') || '')}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color }}>
            {t('learnMore')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </motion.div>
    );
  };

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="section-title text-gray-900 dark:text-white">{t(`${category}Title`)}</h1>
        <p className="section-subtitle mx-auto">{t(`${category}Story`)}</p>
      </div>

      {/* Category description card */}
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 mb-12 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: color + '15', color }}
          >
            {categoryIcons[category]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {t(`${category}Title`)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t(`${category}Story`)}
            </p>
          </div>
        </div>
      </div>

      {/* Products grid */}
      {category === 'run' ? (
        <div className="space-y-10">
          <Link
            href={`/${locale}/vmware-alternative`}
            className="group block rounded-2xl border border-[#7B61FF]/30 bg-gradient-to-r from-[#7B61FF]/10 via-white to-[#00D4FF]/10 dark:from-[#7B61FF]/20 dark:via-zinc-900 dark:to-[#00D4FF]/10 p-6 sm:p-7 hover:shadow-lg transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 rounded-2xl bg-[#7B61FF]/15 text-[#7B61FF] flex items-center justify-center shrink-0">
                <RefreshCw size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7B61FF] mb-1">
                  {locale === 'zh' ? '專題' : 'Featured topic'} · Run
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#7B61FF] transition-colors">
                  {locale === 'zh' ? 'VMware 替代方案' : 'VMware Alternatives'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {locale === 'zh'
                    ? '雙 Hypervisor 遷移 · Sangfor / Huawei / StarWind / Nutanix / Proxmox'
                    : 'Dual-hypervisor migration · Sangfor / Huawei / StarWind / Nutanix / Proxmox'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#7B61FF] shrink-0">
                {locale === 'zh' ? '查看專題' : 'Open topic'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
          {groupedRun.map((group) => (
            <div key={group.key}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: color }} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t(group.i18nKey)}
                </h2>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  ({group.products.length})
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.products.map((product, i) => renderProductCard(product, i))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => renderProductCard(product, i))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No products found in this category.</p>
        </div>
      )}

      {/* Back to all products */}
      <div className="mt-12 text-center">
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#00D4FF] transition-colors"
        >
          ← {t('viewAllProducts')}
        </Link>
      </div>
    </section>
  );
}
