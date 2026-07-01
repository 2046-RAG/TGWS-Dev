'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Code2, Bot, BrainCircuit, Server, Cloud, HardDrive,
  Shield, Lock, MonitorCheck, Network, CloudCog, Bug,
  AlertTriangle, Settings, Database, RefreshCw, Globe, ShieldCheck
} from 'lucide-react';

type TabKey = 'build' | 'run' | 'protect';

interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
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

const iconMap: Record<string, React.ReactNode> = {
  'ai-generated-content-aigc': <Video size={28} />,
  'ai-assisted-coding': <Code2 size={28} />,
  'ai-agent-development': <Bot size={28} />,
  'enterprise-legacy-system-ai-augmentation': <BrainCircuit size={28} />,
  'server-virtualization-platform': <Server size={28} />,
  'hyper-converged-infrastructure': <Database size={28} />,
  'cloud-migration': <Cloud size={28} />,
  'cloud-repatriation': <RefreshCw size={28} />,
  'enterprise-storage-solutions': <HardDrive size={28} />,
  'managed-hosting-services': <Settings size={28} />,
  'business-continuity-disaster-recovery': <Shield size={28} />,
  'next-gen-firewall-ips': <ShieldCheck size={28} />,
  'web-application-firewall': <Lock size={28} />,
  'endpoint-detection-response': <MonitorCheck size={28} />,
  'network-detection-response': <Network size={28} />,
  'cloud-security': <CloudCog size={28} />,
  'sd-wan-load-balancing': <Globe size={28} />,
  'managed-detection-response': <Bug size={28} />,
  'incident-response': <AlertTriangle size={28} />,
};

const tabs: { key: TabKey; label: string }[] = [
  { key: 'build', label: 'Build' },
  { key: 'run', label: 'Run' },
  { key: 'protect', label: 'Protect' },
];

export default function ProductsList({ products }: { products: Product[] }) {
  const t = useTranslations('products');
  const [activeTab, setActiveTab] = useState<TabKey>('build');

  const filtered = products.filter(p => p.category === activeTab);

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
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-6 sm:px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
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
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
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
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: tabColors[activeTab] + '15',
                  color: tabColors[activeTab],
                }}
              >
                {iconMap[product.slug?.current] || <Server size={28} />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#00D4FF] transition-colors">
                {t(product.slug?.current || product.title)}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {(() => {
                  const features = t.raw('features.' + (product.slug?.current || ''));
                  if (Array.isArray(features)) return features.join(' • ');
                  return product.features?.join(' • ') || '';
                })()}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}