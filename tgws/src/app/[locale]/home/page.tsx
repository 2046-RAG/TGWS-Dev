'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
const HeroSection = dynamic(() => import('@/components/hero/HeroSection'));
import { Code2, Server, Shield, ArrowRight, Check, Zap, Users, Building2, Sparkles, Monitor } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════
   Partner Logos — Dual-row opposite-scroll marquee
   ═══════════════════════════════════════════════ */

interface PartnerLogo {
  name: string;
  src: string;
}

function PartnerLogos({ locale, partners }: { locale: string; partners: PartnerLogo[] }) {
  const [paused, setPaused] = useState(false);

  const handleMouseEnter = useCallback(() => setPaused(true), []);
  const handleMouseLeave = useCallback(() => setPaused(false), []);

  const mid = Math.ceil(partners.length / 2);
  const row1 = partners.slice(0, mid);
  const row2 = partners.slice(mid);

  const LogoItem = ({ p }: { p: PartnerLogo }) => (
    <div className="flex flex-col items-center justify-center shrink-0 w-[140px] gap-1.5">
      <div className="w-[64px] h-[64px] flex items-center justify-center bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl hover:border-[#00D4FF]/40 hover:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all duration-300">
        <Image
          src={p.src}
          alt={p.name}
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 text-center leading-tight">
        {p.name}
      </span>
    </div>
  );

  return (
    <div className="py-8 sm:py-10 overflow-hidden bg-[#F4F4F5] dark:bg-zinc-900">
      <div className="text-center mb-5">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {locale === 'zh' ? '技術合作夥伴' : 'Technology Partners'}
        </span>
      </div>
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#F4F4F5] dark:from-zinc-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F4F4F5] dark:from-zinc-900 to-transparent z-10 pointer-events-none" />

        {/* Row 1 - scroll left */}
        <div className="flex mb-2">
          <div className="flex animate-marquee-left" style={{ animationPlayState: paused ? 'paused' : 'running' }}>
            {[...row1, ...row1, ...row1].map((p, i) => (
              <LogoItem key={`r1-${i}`} p={p} />
            ))}
          </div>
        </div>

        {/* Row 2 - scroll right (opposite direction) */}
        <div className="flex">
          <div className="flex animate-marquee-right" style={{ animationPlayState: paused ? 'paused' : 'running' }}>
            {[...row2, ...row2, ...row2].map((p, i) => (
              <LogoItem key={`r2-${i}`} p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  { name: 'Veeam', src: '/logos/veeam.png' },
  { name: 'Fortinet', src: '/logos/fortinet.png' },
  { name: 'Sangfor', src: '/logos/sangfor.png' },
  { name: 'Huawei', src: '/logos/huawei.png' },
  { name: 'Cisco', src: '/logos/cisco.png' },
  { name: 'Dell', src: '/logos/dell.png' },
  { name: 'Nutanix', src: '/logos/nutanix.png' },
  { name: 'Alibaba Cloud', src: '/logos/alibaba-cloud.png' },
  { name: 'ByteDance', src: '/logos/bytedance.png' },
  { name: 'H3C', src: '/logos/h3c.png' },
  { name: 'HP', src: '/logos/hp.png' },
  { name: 'Lenovo', src: '/logos/lenovo.png' },
  { name: 'Sophos', src: '/logos/sophos.png' },
  { name: 'StarWind', src: '/logos/starwind.png' },
  { name: 'Proxmox', src: '/logos/proxmox.png' },
  { name: 'Ruijie', src: '/logos/ruijie.png' },
  { name: 'KVM', src: '/logos/kvm.png' },
  { name: 'Hillstone', src: '/logos/hillstone.png' },
  { name: 'Arcfra', src: '/logos/arcfra.png' },
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

        {/* Bento Grid Layout - Break AI template */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Build - Large card with real image */}
          <div className="md:row-span-2 group anim-card" style={{ animationDelay: '0.1s' }}>
            <div className="card h-full !p-0 overflow-hidden">
              <div className="relative h-48 md:h-full min-h-[280px]">
                <Image
                  src="/images/products/real/aigc.jpg"
                  alt="Build AI workloads"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#00D4FF20' }}
                    >
                      <Code2 size={20} style={{ color: '#00D4FF' }} />
                    </div>
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      {t('build')}
                    </h3>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed mb-4">
                    {t('buildDesc')}
                  </p>
                  <ul className="space-y-2 mb-4">
                    {pillars[0].highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <Check size={14} className="text-[#00D4FF] shrink-0" />
                        <span className="text-xs text-white/80">{t(h)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/${locale}/products`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#00D4FF] hover:underline"
                  >
                    {t('exploreProducts')} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Run - Medium card with real image */}
          <div className="group anim-card" style={{ animationDelay: '0.2s' }}>
            <div className="card h-full !p-0 overflow-hidden">
              <div className="flex flex-col sm:flex-row h-full">
                <div className="relative w-full sm:w-2/5 h-40 sm:h-auto">
                  <Image
                    src="/images/products/real/virtualization.jpg"
                    alt="Run infrastructure"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#7B61FF20' }}
                    >
                      <Server size={20} style={{ color: '#7B61FF' }} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      {t('run')}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                    {t('runDesc')}
                  </p>
                  <Link
                    href={`/${locale}/products`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#7B61FF] hover:underline"
                  >
                    {t('exploreProducts')} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Protect - Medium card with real image */}
          <div className="group anim-card" style={{ animationDelay: '0.3s' }}>
            <div className="card h-full !p-0 overflow-hidden">
              <div className="flex flex-col sm:flex-row h-full">
                <div className="relative w-full sm:w-2/5 h-40 sm:h-auto">
                  <Image
                    src="/images/products/real/firewall.jpg"
                    alt="Protect systems"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#22C55E20' }}
                    >
                      <Shield size={20} style={{ color: '#22C55E' }} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      {t('protect')}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                    {t('protectDesc')}
                  </p>
                  <Link
                    href={`/${locale}/products`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#22C55E] hover:underline"
                  >
                    {t('exploreProducts')} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Block 2.5: AI Journey — Three-Step Flow ═══ */}
      <section className="py-16 sm:py-24 px-5 sm:px-8 bg-gradient-to-b from-white dark:from-zinc-900 to-gray-50 dark:to-zinc-800 scroll-reveal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 anim-fade-up">
            <h2 className="section-title">{t('aiJourneyTitle')}</h2>
            <p className="section-subtitle mx-auto">{t('aiJourneyDesc')}</p>
          </div>

          {/* AI Journey - Visual Flow with real images */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Step 1 - Assessment */}
            <div className="group anim-card" style={{ animationDelay: '0.1s' }}>
              <div className="card h-full !p-0 overflow-hidden">
                <div className="relative h-32">
                  <Image
                    src="/images/products/real/ai-adoption.jpg"
                    alt="AI Assessment"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#7B61FF]/90 to-transparent" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#7B61FF] transition-colors">
                    {t('aiStep1Title')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t('aiStep1Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 - Choose Path */}
            <div className="group anim-card" style={{ animationDelay: '0.2s' }}>
              <div className="card h-full !p-0 overflow-hidden">
                <div className="relative h-32">
                  <Image
                    src="/images/products/real/aigc.jpg"
                    alt="AI Paths"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00D4FF]/90 to-transparent" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#00D4FF] transition-colors">
                    {locale === 'zh' ? '選擇路徑' : 'Choose Path'}
                  </h3>
                  <div className="space-y-2">
                    {[
                      { name: 'AIGC', desc: locale === 'zh' ? '文本/圖像/視頻生成' : 'Text, Image, Video', icon: '🎨' },
                      { name: 'AI Coding', desc: locale === 'zh' ? '開發者AI輔助' : 'Developer AI Tools', icon: '💻' },
                      { name: 'Legacy AI', desc: locale === 'zh' ? '現有系統AI賦能' : 'Legacy System AI', icon: '🔄' },
                    ].map((path) => (
                      <div key={path.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800 hover:bg-[#00D4FF]/5 dark:hover:bg-[#00D4FF]/10 transition-colors">
                        <span className="text-lg">{path.icon}</span>
                        <div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{path.name}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{path.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 - Agent Development */}
            <div className="group anim-card" style={{ animationDelay: '0.3s' }}>
              <div className="card h-full !p-0 overflow-hidden">
                <div className="relative h-32">
                  <Image
                    src="/images/products/real/ai-agent.jpg"
                    alt="AI Agent"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#7B61FF]/90 to-transparent" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#00D4FF] transition-colors">
                    {t('aiStep3Title')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t('aiStep3Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Logos */}
          <div className="flex justify-center gap-8 items-center opacity-50">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{locale === 'zh' ? '合作伙伴' : 'Powered by'}</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Alibaba Cloud Bailian</span>
            <span className="text-gray-300 dark:text-zinc-600">|</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">ByteDance Volcengine</span>
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

              {/* Architecture Diagram + Migration Steps */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Architecture Diagram */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <img
                    src="/images/architecture/vmware-migration.svg"
                    alt="VMware Migration Architecture"
                    className="w-full h-auto opacity-90"
                  />
                </div>

                {/* Migration Steps */}
                <div className="space-y-4">
                  {[
                    { step: '1', title: locale === 'zh' ? '評估就緒度' : 'Assess Readiness', desc: locale === 'zh' ? '盤點VMware許可、工作負載和依賴' : 'Audit licenses, workloads, dependencies' },
                    { step: '2', title: locale === 'zh' ? '邊緣先行' : 'Start at Edge', desc: locale === 'zh' ? '雙Hypervisor架構，非核心業務先行' : 'Dual-hypervisor, non-critical first' },
                    { step: '3', title: locale === 'zh' ? '按節奏遷移' : 'Migrate on Schedule', desc: locale === 'zh' ? '驗證後逐步淘汰，保護現有投資' : 'Validate, phase out, preserve investments' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[#00D4FF]/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/20 flex items-center justify-center shrink-0">
                        <span className="text-[#00D4FF] font-bold text-sm">{item.step}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-medium rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors text-sm shrink-0"
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
        <div className="py-12 sm:py-16 px-5 sm:px-8 bg-white/50 dark:bg-zinc-900/50">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 anim-fade-up">
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
                    <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                      {t(stat.valueKey)}
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">{t(stat.labelKey)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Partner logos - dual-row scrolling marquee */}
        <PartnerLogos locale={locale} partners={partners} />

        {/* Final CTA */}
        <div className="py-14 sm:py-20 px-5 sm:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 anim-fade-up"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.15' }}
            >
              {t('conversionTitle')}
            </h2>
            <p
              className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto anim-fade-up"
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
                href={`/${locale}/contact`}
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
