'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { slugToI18n, iconMap, tabColors, runSubgroups, type TabKey } from './shared';
import { Server, ArrowRight, Search, X, Code2, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

// Real product images - each product has its own UNIQUE image
const imageMap: Record<string, string> = {
  // Build - AI products (5 unique images)
  'ai-generated-content-aigc': '/images/products/real/aigc.jpg',
  'ai-assisted-coding': '/images/products/real/ai-coding.jpg',
  'ai-agent-development': '/images/products/real/ai-agent.jpg',
  'enterprise-legacy-system-ai-augmentation': '/images/products/real/legacy-ai.jpg',
  'ai-adoption-services': '/images/products/real/ai-adoption.jpg',
  // Run - Infrastructure (7 unique images)
  'server-virtualization-platform': '/images/products/real/virtualization.jpg',
  'hyper-converged-infrastructure': '/images/products/real/hci.jpg',
  'cloud-migration': '/images/products/real/cloud.jpg',
  'cloud-repatriation': '/images/products/real/cloud-repatriation.jpg',
  'enterprise-storage-solutions': '/images/products/real/storage.jpg',
  'managed-hosting-services': '/images/products/real/managed-hosting-services.jpg',
  'business-continuity-disaster-recovery': '/images/products/real/business-continuity-disaster-recovery.jpg',
  // Run - Routing & Switching (4 unique images)
  'enterprise-routers': '/images/products/real/routers.jpg',
  'core-switches': '/images/products/real/switches.jpg',
  'access-switches': '/images/products/real/access-switches.jpg',
  'aggregation-switches': '/images/products/real/aggregation-switches.jpg',
  // Run - Wireless (4 unique images)
  'enterprise-wireless-ap': '/images/products/real/enterprise-wireless-ap.jpg',
  'wireless-controllers': '/images/products/real/wireless-controllers.jpg',
  'outdoor-wireless-ap': '/images/products/real/outdoor-wireless-ap.jpg',
  'wifi-6-7-ap': '/images/products/real/wifi-6-7-ap.jpg',
  // Protect - Security (8 unique images)
  'next-gen-firewall-ips': '/images/products/real/next-gen-firewall-ips.jpg',
  'web-application-firewall': '/images/products/real/web-application-firewall.jpg',
  'endpoint-detection-response': '/images/products/real/endpoint-detection-response.jpg',
  'network-detection-response': '/images/products/real/network-detection-response.jpg',
  'cloud-security': '/images/products/real/cloud-security.jpg',
  'sd-wan-load-balancing': '/images/products/real/sd-wan-load-balancing.jpg',
  'managed-detection-response': '/images/products/real/managed-detection-response.jpg',
  'incident-response': '/images/products/real/incident-response.jpg',
};

const tabs: { key: TabKey; i18nKey: string }[] = [
  { key: 'build', i18nKey: 'build' },
  { key: 'run', i18nKey: 'run' },
  { key: 'protect', i18nKey: 'protect' },
];

export default function ProductsList({ products }: { products: Product[] }) {
  const t = useTranslations('products');
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const initialTab = (searchParams.get('category') as TabKey) || 'build';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Filter products by category and search query
  const filtered = useMemo(() => {
    let result = products.filter(p => p.category === activeTab);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => {
        const title = (t(`features.${p.slug?.current}.0`) || p.title).toLowerCase();
        const description = (locale === 'zh' ? p.descriptionZh : p.description).toLowerCase();
        const slug = (p.slug?.current || '').toLowerCase().replace(/-/g, ' ');
        return title.includes(query) || description.includes(query) || slug.includes(query);
      });
    }

    return result;
  }, [products, activeTab, searchQuery, t, locale]);

  // Group products by subcategory for Run tab (single pass with Set lookup)
  const groupedRun: { key: string; i18nKey: string; slugs: string[]; products: Product[] }[] = [];
  for (const group of runSubgroups) {
    const slugSet = new Set(group.slugs);
    const products = filtered.filter(p => slugSet.has(p.slug?.current));
    if (products.length > 0) {
      groupedRun.push({ ...group, products });
    }
  }

  const renderProductCard = (product: Product, index: number) => {
    const slug = product.slug?.current || '';
    const i18nKey = slugToI18n[slug] || '';
    const features = slug ? t.raw('features.' + slug) : null;
    const imageSrc = imageMap[slug];

    return (
      <motion.div
        key={product._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link
          href={`/${locale}/products/${slug}`}
          className="group block bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl overflow-hidden hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200 h-full"
        >
          <div className="relative h-40 overflow-hidden">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={t(i18nKey || product.title)}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  backgroundColor: tabColors[activeTab] + '10',
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: tabColors[activeTab] + '20',
                    color: tabColors[activeTab],
                  }}
                >
                  {iconMap[slug] || <Server size={32} />}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div
              className="absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: tabColors[activeTab] + '20',
                color: tabColors[activeTab],
              }}
            >
              {iconMap[slug] || <Server size={20} />}
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#00D4FF] transition-colors duration-200">
              {t(i18nKey || product.title)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2" style={{ lineHeight: '1.7' }}>
              {Array.isArray(features) ? features.join(' • ') : (product.features?.join(' • ') || '')}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: tabColors[activeTab] }}>
              Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="section-title text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="section-subtitle mx-auto">{t('subtitle')}</p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-4 mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`relative px-6 sm:px-8 py-3 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${
              activeTab === tab.key
                ? 'text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${tabColors[tab.key]}, ${tabColors[tab.key]}CC)`,
                  boxShadow: `0 4px 14px ${tabColors[tab.key]}40`,
                }}
                transition={{ type: 'tween', duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              />
            )}
            <span className="relative z-10">{t(tab.i18nKey)}</span>
          </button>
        ))}
      </div>

      {/* Search Box */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full pl-11 pr-10 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <motion.div
        key={activeTab + '-desc'}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 mb-8 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: tabColors[activeTab] + '15', color: tabColors[activeTab] }}
          >
            {activeTab === 'build' && <Code2 size={24} />}
            {activeTab === 'run' && <Server size={24} />}
            {activeTab === 'protect' && <Shield size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {t(`${activeTab}Title`)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t(`${activeTab}Story`)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* No Results Message */}
      {searchQuery && filtered.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noResults')}</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-[#00D4FF] hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'run' ? (
            // Run tab: group by subcategory
            <div className="space-y-10">
              {groupedRun.map((group) => (
                <div key={group.key}>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: tabColors.run }}
                    />
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
            // Build/Protect: flat grid
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product, i) => renderProductCard(product, i))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No products found in this category.</p>
        </div>
      )}
    </section>
  );
}
