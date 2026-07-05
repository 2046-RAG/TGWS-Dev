'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  ArrowRight, Shield, DollarSign, Zap, Clock,
  Server, Cloud, RefreshCw, Phone
} from 'lucide-react';

export default function VMwareAlternativePage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('vmware');

  const solutions = [
    { key: 'sol1', icon: Server, color: '#E57000', brand: 'Proxmox' },
    { key: 'sol2', icon: Cloud, color: '#0066CC', brand: 'Sangfor' },
    { key: 'sol3', icon: RefreshCw, color: '#00A859', brand: 'Nutanix' },
    { key: 'sol4', icon: Server, color: '#D4213D', brand: 'H3C' },
  ];

  const steps = [
    { num: '01', key: 'step1', icon: Zap },
    { num: '02', key: 'step2', icon: Clock },
    { num: '03', key: 'step3', icon: RefreshCw },
    { num: '04', key: 'step4', icon: Shield },
  ];

  const reasons = [
    { key: 'reason1', icon: DollarSign, color: '#EF4444' },
    { key: 'reason2', icon: Shield, color: '#F59E0B' },
    { key: 'reason3', icon: Clock, color: '#8B5CF6' },
    { key: 'reason4', icon: Server, color: '#6366F1' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-5 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/5 to-[#00D4FF]/5" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="scroll-reveal">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#7B61FF]/10 text-[#7B61FF] text-sm font-medium mb-6">
              {t('heroTag')}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              {t('heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10" style={{ lineHeight: '1.7' }}>
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/contact`}
                className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4"
              >
                {t('heroCta')} <ArrowRight size={18} />
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Phone size={16} /> {t('ctaPhone')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Migrate Section */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.15' }}>{t('whyTitle')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t('whySubtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {reasons.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.key}
                  className="card p-6 flex items-start gap-4 scroll-reveal"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: r.color + '15', color: r.color }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t(`${r.key}Title`)}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{t(`${r.key}Desc`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.15' }}>{t('solutionsTitle')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t('solutionsSubtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className="card p-6 text-center hover:shadow-lg transition-shadow scroll-reveal"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: s.color + '15', color: s.color }}
                  >
                    <Icon size={28} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t(`${s.key}Title`)}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{t(`${s.key}Desc`)}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12 scroll-reveal">
            <Link
              href={`/${locale}/products`}
              className="btn-secondary inline-flex items-center gap-2 text-sm"
            >
              {t('viewAllProducts')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Migration Process Section */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.15' }}>{t('processTitle')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t('processSubtitle')}</p>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00D4FF] via-[#7B61FF] to-[#22C55E] hidden sm:block" />
            <div className="space-y-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const colors = ['#00D4FF', '#7B61FF', '#8B5CF6', '#22C55E'];
                return (
                  <div
                    key={step.num}
                    className="flex items-start gap-6 scroll-reveal"
                  >
                    <div className="relative z-10 shrink-0">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: colors[i] + '15', color: colors[i] }}
                      >
                        <Icon size={28} />
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="text-sm font-bold" style={{ color: colors[i] }}>
                        {t('stepLabel', { num: step.num })}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{t(`${step.key}`)}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{t(`${step.key}Desc`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 sm:py-24 px-5 sm:px-8 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.15' }}>{t('statsTitle')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: t('stat1'), label: t('stat1Label'), color: '#00D4FF' },
              { value: t('stat2'), label: t('stat2Label'), color: '#7B61FF' },
              { value: t('stat3'), label: t('stat3Label'), color: '#22C55E' },
              { value: t('stat4'), label: t('stat4Label'), color: '#F59E0B' },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center scroll-reveal"
              >
                <div className="text-4xl sm:text-5xl font-bold mb-2" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="scroll-reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.15' }}>{t('ctaTitle')}</h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">{t('ctaSubtitle')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/contact`}
                className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4"
              >
                {t('ctaBtn')} <ArrowRight size={18} />
              </Link>
              <a
                href="tel:+886223456789"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Phone size={16} /> {t('ctaPhone')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
