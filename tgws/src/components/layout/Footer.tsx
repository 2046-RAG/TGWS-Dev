'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-[#18181B] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">{t('products')}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href={`/${locale}/products#build`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('build')}</Link></li>
              <li><Link href={`/${locale}/products#run`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('run')}</Link></li>
              <li><Link href={`/${locale}/products#protect`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('protect')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">{t('solutions')}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href={`/${locale}/solutions?tab=healthcare`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('healthcare')}</Link></li>
              <li><Link href={`/${locale}/solutions?tab=finance`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('finance')}</Link></li>
              <li><Link href={`/${locale}/solutions?tab=retail`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('retail')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">{t('company')}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href={`/${locale}/about`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('aboutUs')}</Link></li>
              <li><Link href={`/${locale}/blog`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('blog')}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">{t('support')}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href={`/${locale}/support`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('tickets')}</Link></li>
              <li><Link href={`/${locale}/support`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('faq')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            {t('copyright')}
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors duration-200">{t('privacy')}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-white transition-colors duration-200">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
