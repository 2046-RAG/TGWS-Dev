'use client';

import { useTranslations } from 'next-intl';
import { Award, Users, Target, Shield, Briefcase, Code, TrendingUp, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Breadcrumb from '@/components/ui/Breadcrumb';

const timeline = [
  { year: '2023' },
  { year: '2023' },
  { year: '2024' },
  { year: '2024' },
  { year: '2025' },
  { year: '2025' },
];

const team = [
  { icon: Briefcase, color: '#00D4FF' },
  { icon: Code, color: '#7B61FF' },
  { icon: TrendingUp, color: '#22C55E' },
];

const qualifications = [
  { icon: Award, color: '#00D4FF' },
  { icon: Shield, color: '#7B61FF' },
  { icon: Target, color: '#22C55E' },
  { icon: Users, color: '#F59E0B' },
];

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <>
      <Breadcrumb items={[{ label: 'About Us' }]} />
      <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
        <h1 className="section-title text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="section-subtitle mx-auto max-w-3xl">{t('intro')}</p>
      </div>

      <div className="mb-24">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{t('timeline.title')}</h2>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-zinc-700 hidden md:block" />
          <div className="space-y-12">
            {timeline.map((item, i) => (
              <div
                key={item.year}
                className={`relative flex flex-col md:flex-row items-center scroll-reveal ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                  <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm">
                    <span className="text-[#00D4FF] font-bold text-lg">{item.year}</span>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{t(`timeline.events.${i}`)}</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full bg-[#00D4FF] border-4 border-[#F4F4F5] dark:border-zinc-900 shrink-0 my-4 md:my-0 z-10" />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-24">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{t('team.title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {team.map((member, i) => {
            const Icon = member.icon;
            const photos = ['/images/team/marco.jpg', '/images/team/rafael.jpg', '/images/team/adrian.jpg'];
            return (
              <div
                key={i}
                className="relative z-10 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 text-center shadow-sm scroll-reveal hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={photos[i]}
                    alt={t(`team.members.${i}.name`)}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-1">{t(`team.members.${i}.name`)}</h3>
                <p className="text-[#00D4FF] text-sm mb-2">{t(`team.members.${i}.role`)}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{t(`team.members.${i}.bio`)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{t('qualifications.title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {qualifications.map((q, i) => {
            const Icon = q.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm scroll-reveal hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200"
              >
                <Icon size={32} style={{ color: q.color }} className="mb-4" />
                <h3 className="text-gray-900 dark:text-white font-semibold mb-2">{t(`qualifications.items.${i}.title`)}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t(`qualifications.items.${i}.description`)}</p>
              </div>
            );
          })}
        </div>
      </div>
      </section>
    </>
  );
}
