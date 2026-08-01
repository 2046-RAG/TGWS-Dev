'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { slugToI18n, iconMap, tabColors, type TabKey } from '../shared';
import { Server, Check, ArrowRight, Building2 } from 'lucide-react';

interface VendorSolution {
  vendor: string;
  solution: string;
  description?: string;
  descriptionZh?: string;
}

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
  relatedVendors?: VendorSolution[];
}

const vendorColors: Record<string, string> = {
  bytedance: '#FE2C55',
  alibaba: '#FF6A00',
  huawei: '#CF0A2C',
  sangfor: '#00A3E0',
  fortinet: '#EE2E24',
  nutanix: '#00B0D7',
  cisco: '#049FD9',
  h3c: '#00B0F0',
  ruijie: '#0099FF',
  proxmox: '#E57000',
  sophos: '#FFB800',
  dell: '#007DB8',
  hp: '#0096D6',
  lenovo: '#E2231A',
  veam: '#00B248',
  starwind: '#2196F3',
  hillstone: '#00A8E8',
};

function getVendorColor(vendor: string): string {
  const key = vendor.toLowerCase().replace(/[^a-z]/g, '');
  for (const [k, v] of Object.entries(vendorColors)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return '#6B7280';
}

export default function ProductDetail({ product }: { product: Product }) {
  const t = useTranslations('products');
  const params = useParams();
  const locale = params.locale as string;
  const slug = product.slug?.current || '';
  const i18nKey = slugToI18n[slug] || '';
  const color = tabColors[product.category as TabKey] || '#00D4FF';
  const features = t.raw('features.' + slug);
  const isZh = locale === 'zh';
  const description = isZh ? (product.descriptionZh || product.description) : product.description;
  const relatedVendors = product.relatedVendors || [];

  return (
    <section className="py-20 px-5 sm:px-8 max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: color + '15', color }}
          >
            {iconMap[slug] || <Server size={32} />}
          </div>
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ backgroundColor: color + '15', color }}
            >
              {product.category}
            </span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {t(i18nKey || product.title)}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Features */}
      {Array.isArray(features) && features.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature: string, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: color + '15' }}
                >
                  <Check size={12} style={{ color }} />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-2xl p-8 text-center mb-12"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Interested in {t(i18nKey || product.title)}?</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Get a customized proposal for your infrastructure needs.</p>
        <Link
          href={`/${locale}/contact`}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          Contact Us <ArrowRight size={16} />
        </Link>
      </motion.div>

      {/* Related Vendor Solutions */}
      {relatedVendors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Related Vendor Solutions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Recommended products and platforms from our technology partners
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedVendors.map((v, i) => {
              const vColor = getVendorColor(v.vendor);
              const desc = isZh ? (v.descriptionZh || v.description) : v.description;
              return (
                <div
                  key={i}
                  className="group bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: vColor + '15', color: vColor }}
                    >
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{v.vendor}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{v.solution}</p>
                    </div>
                  </div>
                  {desc && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </section>
  );
}
