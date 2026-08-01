'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';
import UserMenu from '@/components/ui/UserMenu';
import GlobalSearch from '@/components/ui/GlobalSearch';
import MegaMenu from './MegaMenu';
import { Search } from 'lucide-react';

export default function Navbar() {
  const t = useTranslations('nav');
  const home = useTranslations('home');
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close the mobile menu on Escape (AUDIT-160).
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const megaMenuItems = [
    {
      key: 'products',
      label: t('products'),
      href: `/${locale}/products`,
      children: [
        { label: t('build'), href: `/${locale}/products#build`, desc: home('buildDesc') },
        { label: t('run'), href: `/${locale}/products#run`, desc: home('runDesc') },
        { label: t('protect'), href: `/${locale}/products#protect`, desc: home('protectDesc') },
        { label: 'VMware Alternatives', href: `/${locale}/vmware-alternative`, desc: locale === 'zh' ? '替代方案与TCO对比' : 'Alternatives & TCO comparison' },
        { label: 'TCO Calculator', href: `/${locale}/vmware-alternative#tco-calculator`, desc: locale === 'zh' ? '对比VMware/Sangfor/Nutanix' : 'Compare VMware vs Sangfor vs Nutanix' },
      ],
    },
    {
      key: 'solutions',
      label: t('solutions'),
      href: `/${locale}/solutions`,
      children: [
        { label: t('healthcare'), href: `/${locale}/solutions?tab=healthcare`, desc: '' },
        { label: t('finance'), href: `/${locale}/solutions?tab=finance`, desc: '' },
        { label: t('retail'), href: `/${locale}/solutions?tab=retail`, desc: '' },
        { label: t('logistics'), href: `/${locale}/solutions?tab=logistics`, desc: '' },
        { label: t('education'), href: `/${locale}/solutions?tab=education`, desc: '' },
        { label: t('government'), href: `/${locale}/solutions?tab=government`, desc: '' },
      ],
    },
    {
      key: 'blog',
      label: t('blog'),
      href: `/${locale}/blog`,
      children: [
        { label: t('allPosts'), href: `/${locale}/blog`, desc: '' },
        { label: t('technical'), href: `/${locale}/blog`, desc: '' },
        { label: t('industry'), href: `/${locale}/blog`, desc: '' },
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
        { label: t('signIn'), href: `/${locale}/support/login`, desc: '' },
        { label: t('createAccount'), href: `/${locale}/support/register`, desc: '' },
      ],
    },
  ];

  // Check if Home link is active
  const isHomeActive = pathname === `/${locale}` || pathname === `/${locale}/`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-black/5 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <span className="text-[21px] sm:text-[26px] font-bold tracking-tight text-black dark:text-white group-hover:text-[#00D4FF] transition-colors duration-200" style={{ fontFamily: 'var(--font-heading)' }}>
            TechGuru
          </span>
          <span className="text-[12px] text-black/60 dark:text-white/60 align-super">®</span>
          <span className="text-[25px] sm:text-[30px] text-black dark:text-white select-none group-hover:text-[#00D4FF] transition-colors duration-200" style={{ letterSpacing: '-0.02em' }}>✳︎</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href={`/${locale}`}
            className={`nav-link relative text-[14px] font-medium tracking-[-0.01em] py-1 transition-colors duration-200 ${
              isHomeActive
                ? 'text-[#00D4FF]'
                : 'text-black/70 dark:text-white/70 hover:text-[#00D4FF]'
            }`}
          >
            {t('home')}
            {isHomeActive && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D4FF]" />
            )}
          </Link>
          <MegaMenu items={megaMenuItems} activePath={pathname} />
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href={`/${locale}/contact`}
            className={`nav-link relative text-[14px] font-medium tracking-[-0.01em] py-1 transition-colors duration-200 ${
              pathname?.includes('/contact')
                ? 'text-[#00D4FF]'
                : 'text-black/70 dark:text-white/70 hover:text-[#00D4FF]'
            }`}
          >
            {t('contact')}
            {pathname?.includes('/contact') && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D4FF]" />
            )}
          </Link>
          <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700" />
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            title="Search"
          >
            <Search size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu />
        </div>

        {/* Global Search Modal */}
        <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <button
          className="md:hidden flex flex-col gap-[5px] p-2 w-11 h-11 items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span
            className={`w-6 h-[2px] bg-black dark:bg-white transition-all duration-300 ${
              mobileOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black dark:bg-white transition-all duration-300 ${
              mobileOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black dark:bg-white transition-all duration-300 ${
              mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </div>

      <div
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? 'true' : undefined}
        aria-label={mobileOpen ? t('home') : undefined}
        className={`md:hidden fixed inset-0 top-[73px] glass-nav z-40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-start px-8 py-8 gap-8">
          <button
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(true);
            }}
            className="flex items-center gap-3 text-[32px] font-medium text-black dark:text-white hover:text-[#00D4FF] transition-colors duration-200"
          >
            <Search size={24} />
            Search
          </button>
          <Link
            href={`/${locale}`}
            className="text-[32px] font-medium text-black dark:text-white hover:text-[#00D4FF] transition-colors duration-200"
            onClick={() => setMobileOpen(false)}
          >
            {t('home')}
          </Link>
          {megaMenuItems.map((item) => (
            <div key={item.key}>
              <Link
                href={item.href}
                className="text-[32px] font-medium text-black dark:text-white hover:text-[#00D4FF] transition-colors duration-200"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.children.map((child) => (
                    <Link
                      key={`${item.key}-${child.label}`}
                      href={child.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#00D4FF] py-1 px-2 rounded-lg min-h-[44px] inline-flex items-center transition-colors duration-200"
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
            className="text-[32px] font-medium text-black dark:text-white hover:text-[#00D4FF] transition-colors duration-200"
            onClick={() => setMobileOpen(false)}
          >
            {t('contact')}
          </Link>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700 space-y-3">
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
