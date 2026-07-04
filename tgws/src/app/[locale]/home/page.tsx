'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const HeroSection = dynamic(() => import('@/components/hero/HeroSection'), { ssr: false });
import { Code2, Server, Shield, ArrowRight, Check, Zap, Users, Building2, Heart, ShoppingCart } from 'lucide-react';

/* ═══════════════════════════════════════════════
   区块2: Build/Run/Protect 常驻时间轴
   ═══════════════════════════════════════════════ */

const stages = [
  {
    key: 'build',
    icon: Code2,
    color: '#00D4FF',
    count: 5,
    features: ['aigcT2V', 'aigcI2V', 'aigcCoding', 'aiAgent', 'legacyAI'],
  },
  {
    key: 'run',
    icon: Server,
    color: '#7B61FF',
    count: 8,
    features: ['vmPlatform', 'hci', 'cloudPlatform', 'hardware', 'hosting', 'bcdr', 'routing_switching', 'wireless'],
  },
  {
    key: 'protect',
    icon: Shield,
    color: '#22C55E',
    count: 8,
    features: ['ngfw', 'waf', 'edr', 'ndr', 'cloudSecurity', 'sdwan', 'mdr', 'incidentResponse'],
  },
];

/* ═══════════════════════════════════════════════
   区块4: 行业解决方案精选
   ═══════════════════════════════════════════════ */

const industries = [
  { key: 'healthcare', icon: Heart, color: '#00D4FF' },
  { key: 'finance', icon: Building2, color: '#7B61FF' },
  { key: 'retail', icon: ShoppingCart, color: '#22C55E' },
];

/* ═══════════════════════════════════════════════
   区块5: 数据统计
   ═══════════════════════════════════════════════ */

const stats = [
  { value: '500+', labelKey: 'clients', icon: Users },
  { value: '99.99%', labelKey: 'uptime', icon: Zap },
  { value: '15+', labelKey: 'years', icon: Building2 },
  { value: '50+', labelKey: 'partners', icon: Check },
];

export default function HomePage() {
  const t = useTranslations('home');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <>
      <HeroSection />

      {/* ═══ 区块2: Build. Run. Protect. 常驻时间轴 ═══ */}
      <section className="py-16 sm:py-24 px-5 sm:px-8 max-w-6xl mx-auto scroll-reveal">
        {/* 标题 */}
        <div className="text-center mb-12 sm:mb-16 anim-fade-up">
          <h2 className="section-title">Build. Run. Protect.</h2>
          <p className="section-subtitle mx-auto">{t('journeyDesc')}</p>
        </div>

        {/* 时间轴 + 常驻内容 */}
        <div className="relative">
          {/* 连接线（桌面端） */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-[2px] bg-gray-200 anim-line-grow">
            <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#00D4FF] via-[#7B61FF] to-[#22C55E]" />
          </div>

          {/* 三列：节点 + 内容卡片 */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 md:gap-6">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.key}
                  className="flex-1 flex flex-col items-center"
                >
                  {/* 节点圆 */}
                  <div
                    className="relative z-10 w-[104px] h-[104px] rounded-full bg-white border-2 flex flex-col items-center justify-center anim-node"
                    style={{
                      borderColor: stage.color,
                      boxShadow: `0 0 0 6px ${stage.color}12, 0 4px 20px ${stage.color}15`,
                      animationDelay: `${0.3 + index * 0.2}s`,
                    }}
                  >
                    <Icon size={28} style={{ color: stage.color }} strokeWidth={1.8} />
                    <span className="text-sm font-bold text-gray-900 mt-1">{t(stage.key)}</span>
                  </div>

                  {/* 数量 */}
                  <div className="mt-5 text-center anim-fade-up" style={{ animationDelay: `${0.6 + index * 0.2}s` }}>
                    <span className="text-3xl font-bold" style={{ color: stage.color }}>
                      {stage.count}
                    </span>
                    <span className="text-sm text-gray-400 ml-1">{t('products')}</span>
                  </div>

                  {/* 内容卡片（常驻显示） */}
                  <div
                    className="mt-6 w-full card anim-card"
                    style={{
                      animationDelay: `${0.8 + index * 0.2}s`,
                      padding: '24px 20px',
                    }}
                  >
                    {/* 描述 */}
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {t(`${stage.key}Desc`)}
                    </p>

                    {/* 产品标签 */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {stage.features.map((f) => (
                        <span
                          key={f}
                          className="text-[11px] px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${stage.color}10`,
                            color: stage.color,
                          }}
                        >
                          {t(f)}
                        </span>
                      ))}
                    </div>

                    {/* 跳转链接 */}
                    <Link
                      href={`/${locale}/products`}
                      className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ color: stage.color }}
                    >
                      {t('exploreProducts')} <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 区块3: VMware替代方案 ═══ */}
      <section className="py-14 sm:py-24 px-5 sm:px-8 bg-white/50 scroll-reveal">
        <div className="max-w-6xl mx-auto">
          <div className="card overflow-hidden anim-fade-up" style={{ padding: 0 }}>
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-8 sm:p-12">
                <p className="text-sm font-medium text-[#7B61FF] mb-3">
                  {t('vmwareLabel')}
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('vmwareTitle')}
                </h2>
                <p className="text-base text-gray-500 leading-relaxed mb-8">{t('vmwareDesc')}</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {['vmwareFeature1', 'vmwareFeature2', 'vmwareFeature3', 'vmwareFeature4'].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check size={16} className="text-[#22C55E] mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600">{t(f)}</span>
                    </div>
                  ))}
                </div>
                <Link href={`/${locale}/vmware-alternative`} className="btn-primary inline-flex items-center gap-2 text-sm">
                  {t('vmwareCta')} <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex-1 bg-gray-50 p-8 sm:p-12 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 opacity-70">
                  {[
                    { name: 'Proxmox', src: '/logos/proxmox.svg' },
                    { name: 'Sangfor', src: '/logos/sangfor.png' },
                    { name: 'Nutanix', src: '/logos/nutanix.svg' },
                    { name: 'Arcfra', src: '/logos/arcfra.png' },
                    { name: 'H3C', src: '/logos/h3c.png' },
                    { name: 'KVM', src: '/logos/kvm.svg' },
                  ].map((brand) => (
                    <div key={brand.name} className="flex items-center justify-center bg-white rounded-xl border border-gray-200 px-4 py-3">
                      <img src={brand.src} alt={brand.name} className="h-6 w-auto object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 区块4: 行业解决方案精选 ═══ */}
      <section className="py-14 sm:py-24 px-5 sm:px-8 scroll-reveal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 anim-fade-up">
            <h2 className="section-title">{t('industriesTitle')}</h2>
            <p className="section-subtitle mx-auto">{t('industriesDesc')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <Link
                  key={ind.key}
                  href={`/${locale}/solutions`}
                  className="card group text-center anim-card"
                  style={{ animationDelay: `${0.1 + i * 0.1}s`, padding: '40px 32px' }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${ind.color}10` }}>
                    <Icon size={32} style={{ color: ind.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#00D4FF] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                    {t(`industries.${ind.key}.name`)}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {t(`industries.${ind.key}.description`)}
                  </p>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-12 anim-fade-up" style={{ animationDelay: '0.5s' }}>
            <Link href={`/${locale}/solutions`} className="btn-secondary inline-flex items-center gap-2 text-sm">
              {t('viewAllSolutions')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 区块5: 数据统计 ═══ */}
      <section className="py-14 sm:py-24 px-5 sm:px-8 bg-white/50 scroll-reveal">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={stat.labelKey} className="text-center anim-card" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                  <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-[#00D4FF]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{t(`stats.${stat.labelKey}`)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 区块6: 合作伙伴Logo墙 ═══ */}
      <section className="py-12 sm:py-20 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-600 mb-10">{t('partnersLabel')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { name: 'H3C', src: '/logos/h3c.png', delay: '0s' },
              { name: 'Sophos', src: '/logos/sophos.png', delay: '0.1s' },
              { name: 'Fortinet', src: '/logos/fortinet.svg', delay: '0.2s' },
              { name: 'Huawei', src: '/logos/huawei.svg', delay: '0.3s' },
              { name: 'Cisco', src: '/logos/cisco.svg', delay: '0.4s' },
              { name: 'Ruijie', src: '/logos/ruijie.svg', delay: '0.5s' },
              { name: 'Arcfra', src: '/logos/arcfra.png', delay: '0.6s' },
              { name: 'KVM', src: '/logos/kvm.svg', delay: '0.7s' },
            ].map((p) => (
              <div
                key={p.name}
                className="partner-logo flex items-center justify-center bg-white rounded-xl border border-gray-200/60 px-5 py-3 cursor-default transition-all duration-300 hover:border-gray-300 hover:shadow-md hover:scale-105"
                style={{ animationDelay: p.delay }}
              >
                <img src={p.src} alt={p.name} className="h-7 w-auto max-w-[100px] object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 区块7: CTA区域 ═══ */}
      <section className="py-14 sm:py-24 px-5 sm:px-8 scroll-reveal">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 anim-fade-up" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('ctaTitle')}
          </h2>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto anim-fade-up" style={{ animationDelay: '0.1s' }}>
            {t('ctaDesc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 anim-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link href={`/${locale}/contact`} className="btn-primary inline-flex items-center gap-2 text-sm">
              {t('ctaPrimary')} <ArrowRight size={16} />
            </Link>
            <Link href={`/${locale}/support`} className="btn-secondary inline-flex items-center gap-2 text-sm">
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
