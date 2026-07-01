'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import HeroSection from '@/components/hero/HeroSection';
import { Code2, Server, Shield, ArrowRight, Check, Zap, Users, Building2 } from 'lucide-react';

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
    count: 6,
    features: ['vmPlatform', 'hci', 'cloudPlatform', 'hardware', 'hosting', 'bcdr'],
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
  { key: 'healthcare', icon: '🏥' },
  { key: 'finance', icon: '🏦' },
  { key: 'retail', icon: '🛒' },
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
      <section className="py-24 sm:py-32 px-5 sm:px-8 max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-20 anim-fade-up">
          <p className="text-sm font-medium text-[#00D4FF] uppercase tracking-widest mb-4">
            {t('journeyLabel')}
          </p>
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
      <section className="py-20 sm:py-28 px-5 sm:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="card overflow-hidden anim-fade-up" style={{ padding: 0 }}>
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-8 sm:p-12">
                <p className="text-sm font-medium text-[#7B61FF] uppercase tracking-widest mb-3">
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
                <Link href={`/${locale}/products`} className="btn-primary inline-flex items-center gap-2 text-sm">
                  {t('vmwareCta')} <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex-1 bg-gray-50 p-8 sm:p-12 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 opacity-40">
                  {['Proxmox', 'Sangfor', 'Nutanix', 'Arcfra', 'H3C', 'KVM'].map((brand) => (
                    <div key={brand} className="text-center">
                      <div className="w-16 h-16 mx-auto bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-2">
                        <span className="text-xs font-bold text-gray-400">{brand}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 区块4: 行业解决方案精选 ═══ */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 anim-fade-up">
            <h2 className="section-title">{t('industriesTitle')}</h2>
            <p className="section-subtitle mx-auto">{t('industriesDesc')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((ind, i) => (
              <Link
                key={ind.key}
                href={`/${locale}/solutions`}
                className="card group text-center anim-card"
                style={{ animationDelay: `${0.1 + i * 0.1}s`, padding: '40px 32px' }}
              >
                <div className="text-4xl mb-4">{ind.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#00D4FF] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t(`industries.${ind.key}.name`)}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t(`industries.${ind.key}.description`)}
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12 anim-fade-up" style={{ animationDelay: '0.5s' }}>
            <Link href={`/${locale}/solutions`} className="btn-secondary inline-flex items-center gap-2 text-sm">
              {t('viewAllSolutions')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 区块5: 数据统计 ═══ */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 bg-white/50">
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
      <section className="py-20 sm:py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-10">{t('partnersLabel')}</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-30">
            {['Proxmox', 'Sangfor', 'Nutanix', 'H3C', 'Sophos', 'Fortinet'].map((p) => (
              <div key={p} className="w-28 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-400">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 区块7: CTA区域 ═══ */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
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

      {/* 全局动画样式 */}
      <style jsx global>{`
        /* 入场动画 */
        .anim-fade-up {
          opacity: 0;
          transform: translateY(24px);
          animation: fadeUp 0.6s ease-out forwards;
        }
        .anim-node {
          opacity: 0;
          transform: scale(0.5);
          animation: nodePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .anim-card {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.5s ease-out forwards;
        }
        .anim-line-grow {
          animation: lineGrow 1s 0.3s ease-out both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes nodePop {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes lineGrow {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0 0 0); }
        }
      `}</style>
    </>
  );
}
