'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Award, Users, Target, Shield } from 'lucide-react';

const timeline = [
  { year: '2010' },
  { year: '2014' },
  { year: '2017' },
  { year: '2020' },
  { year: '2023' },
  { year: '2025' },
];

const team = [0, 1, 2, 3];

const qualifications = [
  { icon: Award, color: '#00D4FF' },
  { icon: Shield, color: '#7B61FF' },
  { icon: Target, color: '#00D4FF' },
  { icon: Users, color: '#7B61FF' },
];

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h1 className="section-title text-gray-900">{t('title')}</h1>
        <p className="section-subtitle mx-auto max-w-3xl">{t('intro')}</p>
      </div>

      <div className="mb-24">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">{t('timeline.title')}</h2>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 hidden md:block" />
          <div className="space-y-12">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <span className="text-[#00D4FF] font-bold text-lg">{item.year}</span>
                    <p className="text-gray-600 text-sm mt-2">{t(`timeline.events.${i}`)}</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full bg-[#00D4FF] border-4 border-[#E0E0DB] shrink-0 my-4 md:my-0 z-10" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-24">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">{t('team.title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="relative z-10 bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7B61FF]/20 mx-auto mb-4 flex items-center justify-center">
                <Users size={28} className="text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">{t(`team.members.${i}.name`)}</h3>
              <p className="text-[#00D4FF] text-sm mb-2">{t(`team.members.${i}.role`)}</p>
              <p className="text-gray-500 text-xs">{t(`team.members.${i}.bio`)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">{t('qualifications.title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {qualifications.map((q, i) => {
            const Icon = q.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm"
              >
                <Icon size={32} style={{ color: q.color }} className="mb-4" />
                <h3 className="text-gray-900 font-semibold mb-2">{t(`qualifications.items.${i}.title`)}</h3>
                <p className="text-gray-500 text-sm">{t(`qualifications.items.${i}.description`)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
