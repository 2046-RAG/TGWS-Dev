'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLocale } from 'next-intl';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Breadcrumb with automatic locale handling (AUDIT-075): the current locale
 * is read via useLocale() so callers don't need to pass it, and relative
 * hrefs are auto-prefixed with the locale so /zh routes stay in Chinese.
 */
export default function Breadcrumb({ items, locale: localeProp }: { items: BreadcrumbItem[]; locale?: string }) {
  // Always call the hook (rules-of-hooks); the explicit prop wins when passed.
  const contextLocale = useLocale();
  const activeLocale = localeProp ?? contextLocale;
  const homeLabel = activeLocale === 'zh' ? '首頁' : 'Home';

  const localizedHref = (href: string): string =>
    href.startsWith('/') && !href.startsWith(`/${activeLocale}`) && !href.startsWith('http')
      ? `/${activeLocale}${href}`
      : href;

  return (
    <nav aria-label="Breadcrumb" className="py-4 px-5 sm:px-8 max-w-7xl mx-auto">
      <ol className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link href={`/${activeLocale}`} className="hover:text-[#00D4FF] transition-colors">
            {homeLabel}
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-gray-300 dark:text-gray-500" />
            {item.href ? (
              <Link href={localizedHref(item.href)} className="hover:text-[#00D4FF] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
