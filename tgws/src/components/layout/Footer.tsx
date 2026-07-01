'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-[#D5D5D0] border-t border-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t('products')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href={`/${locale}/products#build`} className="hover:text-gray-900 transition-colors">{t('build')}</Link></li>
              <li><Link href={`/${locale}/products#run`} className="hover:text-gray-900 transition-colors">{t('run')}</Link></li>
              <li><Link href={`/${locale}/products#protect`} className="hover:text-gray-900 transition-colors">{t('protect')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t('solutions')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href={`/${locale}/solutions`} className="hover:text-gray-900 transition-colors">{t('healthcare')}</Link></li>
              <li><Link href={`/${locale}/solutions`} className="hover:text-gray-900 transition-colors">{t('finance')}</Link></li>
              <li><Link href={`/${locale}/solutions`} className="hover:text-gray-900 transition-colors">{t('retail')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href={`/${locale}/about`} className="hover:text-gray-900 transition-colors">{t('aboutUs')}</Link></li>
              <li><Link href={`/${locale}/blog`} className="hover:text-gray-900 transition-colors">{t('blog')}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-gray-900 transition-colors">{t('contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t('support')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href={`/${locale}/support`} className="hover:text-gray-900 transition-colors">{t('tickets')}</Link></li>
              <li><Link href={`/${locale}/support`} className="hover:text-gray-900 transition-colors">{t('faq')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            {t('copyright')}
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href={`/${locale}/privacy`} className="hover:text-gray-900 transition-colors">{t('privacy')}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-gray-900 transition-colors">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
