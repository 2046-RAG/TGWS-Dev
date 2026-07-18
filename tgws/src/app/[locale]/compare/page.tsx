'use client';

import { useTranslations } from 'next-intl';
import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';

const featureKeys = [
  'vmwareMigration',
  'managedSecurity',
  'aigcCapabilities',
  'multiVendor',
  'regionalSupport',
  'hybridCloud',
  'costModel',
];

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 font-medium text-gray-500 w-1/4">{t('table.feature')}</th>
                <th className="text-center p-4 font-bold text-[#00D4FF] bg-[#00D4FF]/5 w-1/4">{t('table.techguru')}</th>
                <th className="text-center p-4 font-medium text-gray-500 w-1/4">{t('table.competitorA')}</th>
                <th className="text-center p-4 font-medium text-gray-500 w-1/4">{t('table.competitorB')}</th>
              </tr>
            </thead>
            <tbody>
              {featureKeys.map((key) => (
                <tr key={key} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">{t(`features.${key}`)}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{t(`features.${key}Desc`)}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                      <Check size={14} /> {t(`features.${key}Tg`)}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-500">{t(`features.${key}A`)}</td>
                  <td className="p-4 text-center text-gray-500">{t(`features.${key}B`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
