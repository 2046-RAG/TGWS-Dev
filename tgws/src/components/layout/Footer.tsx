'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Briefcase, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#18181B] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-8 mb-10">
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
              <li><Link href={`/${locale}/help`} className="hover:text-[#00D4FF] transition-colors duration-200">{t('faq')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">{t('followUs')}</h3>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.linkedin.com/company/techguru-network-data-solutions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0077B5] transition-colors min-h-[44px]"
              >
                <Briefcase size={16} />
                {t('linkedin')}
              </a>
              <a
                href="https://wa.me/639602825051"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#22C55E] transition-colors min-h-[44px]"
              >
                <MessageCircle size={16} />
                {t('whatsapp')}
              </a>
              <a
                href="mailto:Inquiries@techguru-it.asia"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#00D4FF] transition-colors min-h-[44px]"
              >
                <Mail size={16} />
                {t('emailPlaceholder')}
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">{t('newsletter')}</h3>
            <p className="text-sm text-gray-400 mb-3">{t('newsletterDesc')}</p>
            {subscribed ? (
              <p className="text-sm text-[#22C55E]">{t('subscribe')}!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none min-h-[44px]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#00D4FF] text-white text-sm font-medium rounded-lg hover:bg-[#00B8DB] transition-colors min-h-[44px]"
                >
                  {t('subscribe')}
                </button>
              </form>
            )}
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
