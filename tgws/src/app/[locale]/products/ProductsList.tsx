'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Code2, Bot, BrainCircuit, Compass, Server, Cloud, HardDrive,
  Shield, Lock, MonitorCheck, Network, CloudCog, Bug,
  AlertTriangle, Settings, Database, RefreshCw, Globe, ShieldCheck,
  Wifi, Cable, Route, Unplug, Radio, Router, NetworkIcon
} from 'lucide-react';

type TabKey = 'build' | 'run' | 'protect';

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

const tabColors: Record<TabKey, string> = {
  build: '#00D4FF',
  run: '#7B61FF',
  protect: '#22C55E',
};

const slugToI18n: Record<string, string> = {
  'ai-generated-content-aigc': 'aigcT2V',
  'ai-assisted-coding': 'aigcCoding',
  'ai-agent-development': 'aiAgent',
  'enterprise-legacy-system-ai-augmentation': 'legacyAI',
  'ai-adoption-services': 'aiAdoption',
  'server-virtualization-platform': 'vmPlatform',
  'hyper-converged-infrastructure': 'hci',
  'cloud-migration': 'cloudPlatform',
  'cloud-repatriation': 'cloudRepatriation',
  'enterprise-storage-solutions': 'hardware',
  'managed-hosting-services': 'hosting',
  'business-continuity-disaster-recovery': 'bcdr',
  'enterprise-routers': 'enterpriseRouters',
  'core-switches': 'coreSwitches',
  'access-switches': 'accessSwitches',
  'aggregation-switches': 'aggregationSwitches',
  'enterprise-wireless-ap': 'enterpriseWirelessAP',
  'wireless-controllers': 'wirelessControllers',
  'outdoor-wireless-ap': 'outdoorWirelessAP',
  'wifi-6-7-ap': 'wifi67AP',
  'next-gen-firewall-ips': 'ngfw',
  'web-application-firewall': 'waf',
  'endpoint-detection-response': 'edr',
  'network-detection-response': 'ndr',
  'cloud-security': 'cloudSecurity',
  'sd-wan-load-balancing': 'sdwan',
  'managed-detection-response': 'mdr',
  'incident-response': 'incidentResponse',
};

const iconMap: Record<string, React.ReactNode> = {
  'ai-generated-content-aigc': <Video size={28} />,
  'ai-assisted-coding': <Code2 size={28} />,
  'ai-agent-development': <Bot size={28} />,
  'enterprise-legacy-system-ai-augmentation': <BrainCircuit size={28} />,
  'ai-adoption-services': <Compass size={28} />,
  'server-virtualization-platform': <Server size={28} />,
  'hyper-converged-infrastructure': <Database size={28} />,
  'cloud-migration': <Cloud size={28} />,
  'cloud-repatriation': <RefreshCw size={28} />,
  'enterprise-storage-solutions': <HardDrive size={28} />,
  'managed-hosting-services': <Settings size={28} />,
  'business-continuity-disaster-recovery': <Shield size={28} />,
  'enterprise-routers': <Route size={28} />,
  'core-switches': <Cable size={28} />,
  'access-switches': <Network size={28} />,
  'aggregation-switches': <Unplug size={28} />,
  'enterprise-wireless-ap': <Wifi size={28} />,
  'wireless-controllers': <Radio size={28} />,
  'outdoor-wireless-ap': <Router size={28} />,
  'wifi-6-7-ap': <NetworkIcon size={28} />,
  'next-gen-firewall-ips': <ShieldCheck size={28} />,
  'web-application-firewall': <Lock size={28} />,
  'endpoint-detection-response': <MonitorCheck size={28} />,
  'network-detection-response': <Network size={28} />,
  'cloud-security': <CloudCog size={28} />,
  'sd-wan-load-balancing': <Globe size={28} />,
  'managed-detection-response': <Bug size={28} />,
  'incident-response': <AlertTriangle size={28} />,
};

// Run tab subcategory groups
const runSubgroups = [
  { key: 'infrastructure', i18nKey: 'compute', slugs: ['server-virtualization-platform', 'hyper-converged-infrastructure', 'cloud-migration', 'cloud-repatriation', 'enterprise-storage-solutions', 'managed-hosting-services', 'business-continuity-disaster-recovery'] },
  { key: 'routing_switching', i18nKey: 'routing_switching', slugs: ['enterprise-routers', 'core-switches', 'access-switches', 'aggregation-switches'] },
  { key: 'wireless', i18nKey: 'wireless', slugs: ['enterprise-wireless-ap', 'wireless-controllers', 'outdoor-wireless-ap', 'wifi-6-7-ap'] },
];

const tabs: { key: TabKey; i18nKey: string }[] = [
  { key: 'build', i18nKey: 'build' },
  { key: 'run', i18nKey: 'run' },
  { key: 'protect', i18nKey: 'protect' },
];

export default function ProductsList({ products }: { products: Product[] }) {
  const t = useTranslations('products');
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = (searchParams.get('category') as TabKey) || 'build';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const filtered = products.filter(p => p.category === activeTab);

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

    return (
      <motion.div
        key={product._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200"
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
          style={{
            backgroundColor: tabColors[activeTab] + '15',
            color: tabColors[activeTab],
          }}
        >
          {iconMap[slug] || <Server size={28} />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#00D4FF] transition-colors duration-200">
          {t(i18nKey || product.title)}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed" style={{ lineHeight: '1.7' }}>
          {Array.isArray(features) ? features.join(' • ') : (product.features?.join(' • ') || '')}
        </p>
      </motion.div>
    );
  };

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="section-title text-gray-900">{t('title')}</h1>
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
                : 'text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:border-gray-300'
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

      <motion.div
        key={activeTab + '-desc'}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm"
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
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {t(`${activeTab}Title`)}
            </h3>
            <p className="text-sm text-gray-600">
              {t(`${activeTab}Story`)}
            </p>
          </div>
        </div>
      </motion.div>

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
                    <h2 className="text-xl font-bold text-gray-900">
                      {t(group.i18nKey)}
                    </h2>
                    <span className="text-sm text-gray-400">
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
          <p className="text-gray-500 text-lg">No products found in this category.</p>
        </div>
      )}
    </section>
  );
}
