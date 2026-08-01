'use client';

import { useTranslations, useLocale } from 'next-intl';
import { 
  Calendar, Building2, Users, Rocket, TrendingUp, 
  Globe, Award, ChevronDown, Code, Shield 
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { TimelineEvent } from './timeline-data';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  rocket: Rocket,
  building: Building2,
  users: Users,
  trending: TrendingUp,
  globe: Globe,
  award: Award,
  code: Code,
  shield: Shield,
};

interface TimelineClientProps {
  events: TimelineEvent[];
}

export default function TimelineClient({ events }: TimelineClientProps) {
  const t = useTranslations('about.timeline');
  const aboutT = useTranslations('about');
  const locale = useLocale();
  const isZh = locale === 'zh';

  return (
    <>
      <Breadcrumb items={[{ label: aboutT('title'), href: '/about' }, { label: t('page_title') }]} />
      
      {/* Hero Section */}
      <section className="relative py-20 px-5 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 via-transparent to-[#7B61FF]/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="section-title text-gray-900 dark:text-white mb-6">
            {t('page_title')}
          </h1>
          <p className="section-subtitle mx-auto max-w-2xl text-lg">
            {t('page_subtitle')}
          </p>
          <div className="mt-8 flex justify-center">
            <ChevronDown className="w-6 h-6 text-[#00D4FF] animate-bounce" />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-5 sm:px-8 max-w-6xl mx-auto">
        <div className="relative">
          {/* Vertical Line - Desktop */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00D4FF] via-[#7B61FF] to-[#22C55E] hidden md:block" />
          
          {/* Vertical Line - Mobile */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#00D4FF] via-[#7B61FF] to-[#22C55E] md:hidden" />

          <div className="space-y-12 md:space-y-16">
            {events.map((event, i) => {
              const Icon = iconMap[event.icon] || Rocket;
              const isEven = i % 2 === 0;
              const title = isZh ? event.titleZh : event.title;
              const description = isZh ? event.descriptionZh : event.description;
              const highlights = isZh ? event.highlightsZh : event.highlights;
              
              return (
                <div
                  key={event._id}
                  className={`relative flex flex-col md:flex-row items-start md:items-center scroll-reveal ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content Card */}
                  <div className={`flex-1 ${isEven ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'} pl-16 md:pl-0`}>
                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-[#00D4FF]/30 transition-all duration-300 group">
                      {/* Year Badge */}
                      <div className={`flex items-center gap-2 mb-3 ${isEven ? 'md:justify-end' : ''}`}>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {event.year}
                        </span>
                        <span className="px-2 py-0.5 bg-[#00D4FF]/10 text-[#00D4FF] text-xs font-medium rounded-full">
                          {event.quarter}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#00D4FF] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                        {title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                        {description}
                      </p>
                      
                      {/* Highlights */}
                      {highlights && highlights.length > 0 && (
                        <div className={`flex flex-wrap gap-2 ${isEven ? 'md:justify-end' : ''}`}>
                          {highlights.map((highlight, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 z-10">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: event.color }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="flex-1 hidden md:block" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('no_events')}
            </p>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '2023', label: t('stats.founded'), color: '#00D4FF' },
            { value: '20+', label: t('stats.vendors'), color: '#7B61FF' },
            { value: '15+', label: t('stats.team'), color: '#22C55E' },
            { value: '100+', label: t('stats.clients'), color: '#F59E0B' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-6 text-center scroll-reveal"
            >
              <div className="text-3xl font-bold mb-2" style={{ color: stat.color, fontFamily: 'var(--font-heading)' }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}