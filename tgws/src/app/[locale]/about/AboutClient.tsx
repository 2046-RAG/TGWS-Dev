'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Award, Users, Target, Shield, Briefcase, Code, ArrowRight, Calendar } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { TeamMember, Qualification } from './about-data';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  award: Award,
  shield: Shield,
  target: Target,
  users: Users,
  building: Briefcase,
  code: Code,
};

interface AboutClientProps {
  teamMembers: TeamMember[];
  qualifications: Qualification[];
}

export default function AboutClient({ teamMembers, qualifications }: AboutClientProps) {
  const t = useTranslations('about');
  const locale = useLocale();
  const isZh = locale === 'zh';

  return (
    <>
      <Breadcrumb items={[{ label: 'About Us' }]} />
      <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="section-title text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="section-subtitle mx-auto max-w-3xl">{t('intro')}</p>
        </div>

        {/* Timeline Preview with Link */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              {t('timeline.title')}
            </h2>
            <Link
              href="/about/timeline"
              className="inline-flex items-center gap-2 text-[#00D4FF] hover:text-[#00B8E6] transition-colors font-medium"
            >
              <Calendar className="w-4 h-4" />
              {t('timeline.view_all')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Simplified Timeline Preview */}
          <div className="bg-gradient-to-r from-[#00D4FF]/5 via-transparent to-[#7B61FF]/5 rounded-2xl p-8">
            <div className="flex flex-wrap justify-center gap-4">
              {['2023', '2024', '2025'].map((year) => (
                <div key={year} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#00D4FF]" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{year}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">
              {t('timeline.preview_hint')}
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            {t('team.title')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member) => {
              const name = isZh ? (member.nameZh || member.name) : member.name;
              const role = isZh ? (member.roleZh || member.role) : member.role;
              const bio = isZh ? (member.bioZh || member.bio) : member.bio;
              
              return (
                <div
                  key={member._id}
                  className="relative z-10 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 text-center shadow-sm scroll-reveal hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {member.avatar?.asset?.url ? (
                      <img
                        src={member.avatar.asset.url}
                        alt={name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#00D4FF] to-[#7B61FF] rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-semibold mb-1">{name}</h3>
                  <p className="text-[#00D4FF] text-sm mb-2">{role}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{bio}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Qualifications Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            {t('qualifications.title')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualifications.map((q) => {
              const Icon = iconMap[q.icon] || Award;
              const title = isZh ? q.titleZh : q.title;
              const description = isZh ? q.descriptionZh : q.description;
              
              return (
                <div
                  key={q._id}
                  className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm scroll-reveal hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200"
                >
                  <Icon size={32} style={{ color: q.color }} className="mb-4" />
                  <h3 className="text-gray-900 dark:text-white font-semibold mb-2">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}