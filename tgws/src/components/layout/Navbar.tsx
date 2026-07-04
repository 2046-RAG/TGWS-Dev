'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import MegaMenu from './MegaMenu';

export default function Navbar() {
  const t = useTranslations('nav');
  const auth = useTranslations('auth');
  const home = useTranslations('home');
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  const megaMenuItems = [
    {
      key: 'products',
      label: t('products'),
      href: `/${locale}/products`,
      children: [
        { label: 'Build', href: `/${locale}/products#build`, desc: home('buildDesc') },
        { label: 'Run', href: `/${locale}/products#run`, desc: home('runDesc') },
        { label: 'Protect', href: `/${locale}/products#protect`, desc: home('protectDesc') },
      ],
    },
    {
      key: 'solutions',
      label: t('solutions'),
      href: `/${locale}/solutions`,
      children: [
        { label: 'Healthcare', href: `/${locale}/solutions`, desc: '' },
        { label: 'Finance', href: `/${locale}/solutions`, desc: '' },
        { label: 'Retail', href: `/${locale}/solutions`, desc: '' },
        { label: 'Logistics', href: `/${locale}/solutions`, desc: '' },
        { label: 'Education', href: `/${locale}/solutions`, desc: '' },
        { label: 'Government', href: `/${locale}/solutions`, desc: '' },
      ],
    },
    {
      key: 'caseStudies',
      label: t('caseStudies'),
      href: `/${locale}/case-studies`,
      children: [
        { label: 'All Industries', href: `/${locale}/case-studies`, desc: '' },
        { label: 'Healthcare', href: `/${locale}/case-studies`, desc: '' },
        { label: 'Finance', href: `/${locale}/case-studies`, desc: '' },
        { label: 'Retail', href: `/${locale}/case-studies`, desc: '' },
      ],
    },
    {
      key: 'blog',
      label: t('blog'),
      href: `/${locale}/blog`,
      children: [
        { label: 'All Posts', href: `/${locale}/blog`, desc: '' },
        { label: 'Technical', href: `/${locale}/blog`, desc: '' },
        { label: 'Industry', href: `/${locale}/blog`, desc: '' },
        { label: 'Case Study', href: `/${locale}/blog`, desc: '' },
      ],
    },
    {
      key: 'about',
      label: t('about'),
      href: `/${locale}/about`,
    },
    {
      key: 'support',
      label: t('support'),
      href: `/${locale}/support`,
      children: [
        { label: auth('signIn'), href: `/${locale}/support/login`, desc: '' },
        { label: auth('createAccount'), href: `/${locale}/support/register`, desc: '' },
      ],
    },
  ];

  const simpleLinks = [
    { href: `/${locale}/home`, label: t('home') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-black/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="text-[21px] sm:text-[26px] font-bold tracking-tight text-black" style={{ fontFamily: 'var(--font-heading)' }}>
            TechGuru
          </span>
          <span className="text-[12px] text-black/60 align-super">®</span>
          <span className="text-[25px] sm:text-[30px] text-black select-none" style={{ letterSpacing: '-0.02em' }}>✳︎</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href={`/${locale}/home`}
            className="text-[23px] text-black hover:opacity-60 transition-opacity duration-200"
          >
            {t('home')}
          </Link>
          <MegaMenu items={megaMenuItems} />
        </div>

        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/contact`}
            className="text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity duration-200"
          >
            {t('contact')}
          </Link>
        </div>

        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              mobileOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              mobileOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </div>

      <div
        className={`md:hidden fixed inset-0 top-[73px] glass-nav z-40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-start px-8 py-8 gap-8">
          <Link
            href={`/${locale}/home`}
            className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
            onClick={() => setMobileOpen(false)}
          >
            {t('home')}
          </Link>
          {megaMenuItems.map((item) => (
            <div key={item.key}>
              <Link
                href={item.href}
                className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="text-sm text-gray-500 hover:text-[#00D4FF] transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href={`/${locale}/contact`}
            className="text-[32px] font-medium text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
            onClick={() => setMobileOpen(false)}
          >
            {t('contact')}
          </Link>
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
