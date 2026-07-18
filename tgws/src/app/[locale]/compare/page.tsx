'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CompareTable from '@/components/compare/CompareTable';

export default function ComparePage() {
  const t = useTranslations('compare');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <>
      <Breadcrumb items={[{ label: t('title') }]} />
      <section className="py-20 px-5 sm:px-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-[#00D4FF] uppercase tracking-wider mb-3">{t('heroTag')}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {t('title')}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">{t('subtitle')}</p>
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl overflow-hidden mb-16 shadow-sm">
        <CompareTable />
      </div>

      {/* Partner Certifications */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t('partnerCertifications')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { vendor: 'Sangfor', certKey: 'authorizedPartner', color: '#00A8E8' },
            { vendor: 'Fortinet', certKey: 'authorizedReseller', color: '#EE2E24' },
            { vendor: 'Nutanix', certKey: 'channelPartner', color: '#000000' },
            { vendor: 'Ruijie', certKey: 'certifiedPartner', color: '#0066CC' },
            { vendor: 'Huawei', certKey: 'certifiedPartner', color: '#CF0A2C' },
            { vendor: 'Sundray', certKey: 'authorizedPartner', color: '#FF6600' },
          ].map((item) => (
            <div key={item.vendor} className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: item.color }}>
                {item.vendor.charAt(0)}
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{item.vendor}</p>
              <p className="text-xs text-gray-400">{t(`certs.${item.certKey}`)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gray-50 rounded-2xl p-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('ctaTitle')}</h2>
        <p className="text-gray-500 mb-6">{t('ctaDesc')}</p>
        <Link
          href={`/${locale}/contact`}
          className="btn-primary inline-flex items-center gap-2"
        >
          {t('ctaBtn')} <ArrowRight size={16} />
        </Link>
      </div>
    </section>
    </>
  );
}
