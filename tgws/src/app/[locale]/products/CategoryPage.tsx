'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { slugToI18n, ProductIcon, productImages, tabColors, runSubgroups, type TabKey } from './shared';
import { Code2, Server, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import Image from 'next/image';

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

  /** VMware Alternatives — Run topic card, peer of other Run solutions. */
  const renderVmwareThemeCard = (index: number) => (
    <motion.div
      key="vmware-alternative-theme"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={`/${locale}/vmware-alternative`}
        className="group block bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl overflow-hidden hover:border-[#7B61FF]/40 hover:shadow-lg transition-all duration-200 h-full"
      >
        <div className="relative h-40 overflow-hidden">
          <Image
            src="/images/products/real/virtualization.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center bg-[#7B61FF]/25 text-[#7B61FF]">
            <RefreshCw size={20} />
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#7B61FF] transition-colors">
            {locale === 'zh' ? 'VMware 替代方案' : 'VMware Alternatives'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4" style={{ lineHeight: '1.7' }}>
            {locale === 'zh'
              ? '雙 Hypervisor 漸進遷移 · Sangfor / Huawei / StarWind / Nutanix / Proxmox · TCO 對比'
              : 'Dual-hypervisor phased migration · Sangfor / Huawei / StarWind / Nutanix / Proxmox · TCO compare'}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#7B61FF]">
            {t('learnMore')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.div>
  );

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

      {/* Products grid — Run groups only (no extra pillars) */}
      {category === 'run' ? (
        <div className="space-y-10">
          {groupedRun.map((group) => (
            <div key={group.key}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: color }} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t(group.i18nKey)}
                </h2>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  ({group.products.length + (group.key === 'infrastructure' ? 1 : 0)})
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.key === 'infrastructure' && renderVmwareThemeCard(0)}
                {group.products.map((product, i) => renderProductCard(product, i + (group.key === 'infrastructure' ? 1 : 0)))}
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
