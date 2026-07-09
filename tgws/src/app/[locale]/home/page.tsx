'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
const HeroSection = dynamic(() => import('@/components/hero/HeroSection'));
import { Code2, Server, Shield, ArrowRight, Check, Zap, Users, Building2, Sparkles, Monitor } from 'lucide-react';

/* ═══════════════════════════════════════════════
   Block 2: Core Value — Build. Run. Protect.
   ═══════════════════════════════════════════════ */

const pillars = [
  {
    key: 'build',
    icon: Code2,
    color: '#00D4FF',
    highlights: ['buildHighlight1', 'buildHighlight2', 'buildHighlight3'],
  },
  {
    key: 'run',
    icon: Server,
    color: '#7B61FF',
    highlights: ['runHighlight1', 'runHighlight2', 'runHighlight3'],
  },
  {
    key: 'protect',
    icon: Shield,
    color: '#22C55E',
    highlights: ['protectHighlight1', 'protectHighlight2', 'protectHighlight3'],
  },
];

/* ═══════════════════════════════════════════════
   Block 3: Conversion — Social Proof + CTA
   ═══════════════════════════════════════════════ */

const socialStats = [
  { valueKey: 'socialProofStat1', labelKey: 'socialProofStat1Label', icon: Users },
  { valueKey: 'socialProofStat2', labelKey: 'socialProofStat2Label', icon: Check },
  { valueKey: 'socialProofStat3', labelKey: 'socialProofStat3Label', icon: Zap },
  { valueKey: 'socialProofStat4', labelKey: 'socialProofStat4Label', icon: Building2 },
];

const partners = [
  { name: 'Sangfor', src: '/logos/sangfor.svg' },
  { name: 'Fortinet', src: '/logos/fortinet.svg' },
  { name: 'Nutanix', src: '/logos/nutanix.svg' },
  { name: 'Huawei', src: '/logos/huawei.svg' },
  { name: 'Cisco', src: '/logos/cisco.svg' },
  { name: 'H3C', src: '/logos/h3c.png' },
  { name: 'Ruijie', src: '/logos/ruijie.svg' },
  { name: 'Proxmox', src: '/logos/proxmox.svg' },
  { name: 'KVM', src: '/logos/kvm.svg' },
  { name: 'Arcfra', src: '/logos/arcfra.png' },
  { name: 'Sophos', src: '/logos/sophos.png' },
  { name: 'StarWind', src: '/logos/starwind.svg' },
  { name: 'Hillstone', src: '/logos/hillstone.svg' },
  { name: 'Alibaba Cloud', src: '/logos/alibaba-cloud.svg' },
  { name: 'ByteDance', src: '/logos/bytedance.svg' },
  { name: 'Veeam', src: '/logos/veeam.svg' },
  { name: 'Dell', src: '/logos/dell.svg' },
  { name: 'HP', src: '/logos/hp.svg' },
  { name: 'Lenovo', src: '/logos/lenovo.svg' },
];

export default function HomePage() {
  const t = useTranslations('home');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <>
      {/* ═══ Block 1: Hero ═══ */}
      <HeroSection />

      {/* ═══ Block 2: Core Value — Build. Run. Protect. ═══ */}
      <section className="py-16 sm:py-24 px-5 sm:px-8 max-w-6xl mx-auto scroll-reveal">
        <div className="text-center mb-12 sm:mb-16 anim-fade-up">
          <h2 className="section-title">{t('valueSectionTitle')}</h2>
          <p className="section-subtitle mx-auto">{t('valueSectionDesc')}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.key}
                className="card group anim-card"
                style={{ animationDelay: `${0.1 + index * 0.15}s`, padding: '32px 28px' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${pillar.color}12` }}
                >
                  <Icon size={26} style={{ color: pillar.color }} strokeWidth={1.8} />
                </div>

                <h3
                  className="text-xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {t(pillar.key)}
                </h3>

                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {t(`${pillar.key}Desc`)}
                </p>

                <ul className="space-y-2.5 mb-6">
                  {pillar.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0"
                        style={{ color: pillar.color }}
                      />
                      <span className="text-sm text-gray-600">{t(h)}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/${locale}/products`}
                  className="inline-flex items-center gap-1 text-sm font-medium py-2 px-1 min-h-[44px] transition-colors duration-200 hover:opacity-80"
                  style={{ color: pillar.color }}
                >
                  {t('exploreProducts')} <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ Block 2.5: AI Journey — Three-Step Flow ═══ */}
      <section className="py-16 sm:py-24 px-5 sm:px-8 bg-gradient-to-b from-white to-gray-50 scroll-reveal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 anim-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7B61FF]/10 text-[#7B61FF] text-sm font-medium mb-4">
              <Sparkles size={16} />
              <span>AI Journey</span>
            </div>
            <h2 className="section-title">{t('aiJourneyTitle')}</h2>
            <p className="section-subtitle mx-auto">{t('aiJourneyDesc')}</p>
          </div>

          {/* Three AI Paths - Horizontal Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Step 1 */}
            <div className="relative group anim-card" style={{ animationDelay: '0.1s' }}>
              <div className="card h-full !border-[#7B61FF]/20 hover:!border-[#7B61FF]/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#7B61FF]/10 flex items-center justify-center mb-4">
                  <span className="text-[#7B61FF] font-bold text-lg">1</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#7B61FF] transition-colors">
                  {t('aiStep1Title')}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t('aiStep1Desc')}
                </p>
              </div>
            </div>

            {/* Step 2 - Three Paths */}
            <div className="relative group anim-card" style={{ animationDelay: '0.2s' }}>
              <div className="card h-full !border-[#00D4FF]/20 hover:!border-[#00D4FF]/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center mb-4">
                  <span className="text-[#00D4FF] font-bold text-lg">2</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#00D4FF] transition-colors">
                  {locale === 'zh' ? '選擇路徑' : 'Choose Path'}
                </h3>
                <div className="space-y-2">
                  {[
                    { name: 'AIGC', desc: locale === 'zh' ? '文本/圖像/視頻生成' : 'Text, Image, Video' },
                    { name: 'AI Coding', desc: locale === 'zh' ? '開發者AI輔助' : 'Developer AI Tools' },
                    { name: 'Legacy AI', desc: locale === 'zh' ? '現有系統AI賦能' : 'Legacy System AI' },
                  ].map((path) => (
                    <div key={path.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-[#00D4FF]/5 transition-colors">
                      <Check size={14} className="text-[#00D4FF] shrink-0" />
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{path.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{path.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group anim-card" style={{ animationDelay: '0.3s' }}>
              <div className="card h-full !border-[#7B61FF]/20 hover:!border-[#00D4FF]/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B61FF]/10 to-[#00D4FF]/10 flex items-center justify-center mb-4">
                  <Sparkles size={20} className="text-[#7B61FF]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#00D4FF] transition-colors">
                  {t('aiStep3Title')}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t('aiStep3Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Partner Logos */}
          <div className="flex justify-center gap-8 items-center opacity-50">
            <span className="text-xs font-medium text-gray-400">{locale === 'zh' ? '合作伙伴' : 'Powered by'}</span>
            <span className="text-sm font-semibold text-gray-500">Alibaba Cloud Bailian</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-500">ByteDance Volcengine</span>
          </div>
        </div>
      </section>

      {/* ═══ Block 2.7: VMware Alternatives — Migration Steps ═══ */}
      <section className="py-16 sm:py-24 px-5 sm:px-8 scroll-reveal">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#7B61FF]/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-4 w-fit">
                <Monitor size={16} />
                <span>VMware Alternatives</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                {t('vmwareTitle')}
              </h2>
              <p className="text-white/60 leading-relaxed mb-8 max-w-2xl">
                {t('vmwareDesc')}
              </p>

              {/* Migration Steps */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {[
                  { step: '1', title: locale === 'zh' ? '評估就緒度' : 'Assess Readiness', desc: locale === 'zh' ? '盤點VMware許可、工作負載和依賴' : 'Audit licenses, workloads, dependencies' },
                  { step: '2', title: locale === 'zh' ? '邊緣先行' : 'Start at Edge', desc: locale === 'zh' ? '雙Hypervisor架構，非核心業務先行' : 'Dual-hypervisor, non-critical first' },
                  { step: '3', title: locale === 'zh' ? '按節奏遷移' : 'Migrate on Schedule', desc: locale === 'zh' ? '驗證後逐步淘汰，保護現有投資' : 'Validate, phase out, preserve investments' },
                ].map((item) => (
                  <div key={item.step} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[#00D4FF]/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/20 flex items-center justify-center mb-3">
                      <span className="text-[#00D4FF] font-bold text-sm">{item.step}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Alternatives + CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  {['Proxmox', 'Sangfor', 'Nutanix', 'StarWind', 'H3C'].map((alt) => (
                    <span key={alt} className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10 hover:border-[#00D4FF]/30 transition-colors">
                      {alt}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/${locale}/vmware-alternative`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-colors text-sm shrink-0"
                >
                  {t('vmwareCta')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Block 3: Social Proof + CTA ═══ */}
      <section className="scroll-reveal">
        {/* Stats row */}
        <div className="py-12 sm:py-16 px-5 sm:px-8 bg-white/50">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-gray-500 text-center mb-8 anim-fade-up">
              {t('socialProofLabel')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {socialStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.labelKey}
                    className="text-center anim-stat"
                    style={{ animationDelay: `${0.1 + i * 0.12}s` }}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center mx-auto mb-3">
                      <Icon size={20} className="text-[#00D4FF]" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                      {t(stat.valueKey)}
                    </div>
                    <div className="text-sm text-gray-400">{t(stat.labelKey)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Partner logos */}
        <div className="py-10 sm:py-14 px-5 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {partners.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-2 bg-white rounded-xl border border-gray-200/60 px-3 py-2.5 transition-all duration-300 hover:border-gray-300 hover:shadow-md hover:scale-105 anim-fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <Image
                    src={p.src}
                    alt={p.name}
                    width={70}
                    height={20}
                    loading="lazy"
                    decoding="async"
                    className="h-5 w-auto object-contain"
                  />
                  <span className="text-xs font-medium text-gray-500">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-14 sm:py-20 px-5 sm:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 anim-fade-up"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.15' }}
            >
              {t('conversionTitle')}
            </h2>
            <p
              className="text-lg text-gray-500 mb-8 max-w-xl mx-auto anim-fade-up"
              style={{ animationDelay: '0.1s', lineHeight: '1.7' }}
            >
              {t('conversionDesc')}
            </p>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 anim-fade-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Link
                href={`/${locale}/contact`}
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                {t('conversionPrimary')} <ArrowRight size={16} />
              </Link>
              <Link
                href={`/${locale}/support`}
                className="btn-secondary inline-flex items-center gap-2 text-sm"
              >
                {t('conversionSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
