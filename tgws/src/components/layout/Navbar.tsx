'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: `/${locale}/home`, label: t('home') },
    { href: `/${locale}/products`, label: t('products') },
    { href: `/${locale}/solutions`, label: t('solutions') },
    { href: `/${locale}/case-studies`, label: t('caseStudies') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/support`, label: t('support') }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#E0E0DB]/80 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="text-[21px] sm:text-[26px] font-bold tracking-tight text-black" style={{ fontFamily: 'var(--font-heading)' }}>
            TechGuru
          </span>
          <span className="text-[12px] text-black/60 align-super">®</span>
          <span className="text-[25px] sm:text-[30px] text-black select-none" style={{ letterSpacing: '-0.02em' }}>✳︎</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[23px] text-black hover:opacity-60 transition-opacity duration-200"
            >
              {link.label}
            </Link>
          ))}
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
        className={`md:hidden fixed inset-0 top-[73px] bg-[#E0E0DB]/95 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-start px-8 py-8 gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
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
