'use client';


import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, Shield, DollarSign, Zap, Clock,
  Server, Cloud, RefreshCw, Phone
} from 'lucide-react';

export default function VMwareAlternativePage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        heroTag: 'VMware Alternative',
        heroTitle: 'Break Free from VMware Lock-in',
        heroSubtitle: 'Migrate to cost-effective, open-source alternatives with zero downtime and proven migration paths.',
        heroCta: 'Get Free Assessment',
        whyTitle: 'Why Migrate Away from VMware?',
        whySubtitle: 'Broadcom\'s acquisition has created uncertainty. Now is the time to explore better options.',
        reason1Title: 'Rising Costs',
        reason1Desc: 'VMware licensing costs have increased significantly post-Broadcom acquisition, straining IT budgets.',
        reason2Title: 'Vendor Lock-in',
        reason2Desc: 'Proprietary hypervisor limits flexibility and increases dependency on a single vendor.',
        reason3Title: 'Forced Upgrades',
        reason3Desc: 'Broadcom\'s October 2027 VCF 9 cutover forces organizations to make urgent decisions.',
        reason4Title: 'Limited Support',
        reason4Desc: 'Reduced partner ecosystem and support options following the acquisition.',
        solutionsTitle: 'Our Migration Solutions',
        solutionsSubtitle: 'Proven paths from VMware to open-source and cost-effective alternatives.',
        sol1Title: 'Proxmox VE',
        sol1Desc: 'Open-source enterprise virtualization with KVM, container support, and clustered management.',
        sol2Title: 'Sangfor aSV',
        sol2Desc: 'Hyper-converged infrastructure with built-in virtualization, HCI, and unified management.',
        sol3Title: 'Nutanix AHV',
        sol3Desc: 'Enterprise-grade hyper-converged platform with hybrid cloud capabilities.',
        sol4Title: 'H3C UIS',
        sol4Desc: 'Integrated infrastructure with virtualization, storage, and networking in one platform.',
        processTitle: 'Our Migration Process',
        processSubtitle: 'A structured 4-step approach to minimize risk and downtime.',
        step1: 'Assessment',
        step1Desc: 'Audit your current VMware environment, workloads, and dependencies.',
        step2: 'Planning',
        step2Desc: 'Design the target architecture and create a detailed migration runbook.',
        step3: 'Migration',
        step3Desc: 'Execute the migration with live cutover and zero-downtime validation.',
        step4: 'Optimization',
        step4Desc: 'Fine-tune performance, train your team, and establish ongoing support.',
        statsTitle: 'Proven Track Record',
        stat1: '500+',
        stat1Label: 'VMware Migrations',
        stat2: '99.9%',
        stat2Label: 'Uptime During Migration',
        stat3: '35%',
        stat3Label: 'Average Cost Savings',
        stat4: '24/7',
        stat4Label: 'Post-Migration Support',
        ctaTitle: 'Ready to Explore VMware Alternatives?',
        ctaSubtitle: 'Get a free assessment of your current VMware environment and discover the best migration path for your organization.',
        ctaBtn: 'Schedule Free Assessment',
        ctaPhone: 'Call Us Now',
      },
      zh: {
        heroTag: 'VMware替代方案',
        heroTitle: '擺脫VMware供應商鎖定',
        heroSubtitle: '遷移到具成本效益的開源替代方案，實現零停機和經過驗證的遷移路徑。',
        heroCta: '免費評估',
        whyTitle: '為什麼要遷離VMware？',
        whySubtitle: 'Broadcom收購後帶來不確定性。現在是探索更好選擇的時機。',
        reason1Title: '成本上升',
        reason1Desc: 'Broadcom收購後VMware授權費用大幅增加，加重IT預算壓力。',
        reason2Title: '供應商鎖定',
        reason2Desc: '專有虛擬化程式限制了靈活性，增加了對單一供應商的依賴。',
        reason3Title: '強制升級',
        reason3Desc: 'Broadcom 2027年10月VCF 9轉換迫使組織做出緊急決定。',
        reason4Title: '支援減少',
        reason4Desc: '收購後合作夥伴生態系統和支援選項減少。',
        solutionsTitle: '我們的遷移解決方案',
        solutionsSubtitle: '從VMware到開源和高性價比替代方案的經過驗證的路徑。',
        sol1Title: 'Proxmox VE',
        sol1Desc: '開源企業級虛擬化，支援KVM、容器和集群管理。',
        sol2Title: 'Sangfor aSV',
        sol2Desc: '超融合基礎設施，內建虛擬化、HCI和統一管理。',
        sol3Title: 'Nutanix AHV',
        sol3Desc: '企業級超融合平台，具備混合雲能力。',
        sol4Title: 'H3C UIS',
        sol4Desc: '整合虛擬化、存儲和網絡的統一基礎設施。',
        processTitle: '我們的遷移流程',
        processSubtitle: '結構化的4步方法，最大限度降低風險和停機時間。',
        step1: '評估',
        step1Desc: '審計當前VMware環境、工作負載和依賴項。',
        step2: '規劃',
        step2Desc: '設計目標架構並創建詳細的遷移運行手冊。',
        step3: '遷移',
        step3Desc: '執行遷移，進行即時切換和零停機驗證。',
        step4: '優化',
        step4Desc: '微調性能、培訓團隊並建立持續支援。',
        statsTitle: '經過驗證的業績',
        stat1: '500+',
        stat1Label: 'VMware遷移案例',
        stat2: '99.9%',
        stat2Label: '遷移期間正常運行時間',
        stat3: '35%',
        stat3Label: '平均成本節省',
        stat4: '24/7',
        stat4Label: '遷移後支援',
        ctaTitle: '準備好探索VMware替代方案了嗎？',
        ctaSubtitle: '獲取免費的當前VMware環境評估，發現適合您組織的最佳遷移路徑。',
        ctaBtn: '預約免費評估',
        ctaPhone: '立即致電',
      },
    };
    return translations[locale]?.[key] || translations.en[key] || key;
  };

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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('whyTitle')}</h2>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('solutionsTitle')}</h2>
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
              {locale === 'zh' ? '查看所有產品' : 'View All Products'} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Migration Process Section */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('processTitle')}</h2>
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
                        {locale === 'zh' ? `步驟 ${step.num}` : `Step ${step.num}`}
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('statsTitle')}</h2>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('ctaTitle')}</h2>
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
