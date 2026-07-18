'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /**
   * Optional locale override used to build the home link's URL prefix.
   * When omitted, the locale is read from the nearest `[locale]` route
   * segment via `useParams()`. The home label is always resolved through
   * next-intl (`common.breadcrumb.home`) so it stays in sync with the active
   * locale context.
   */
  locale?: string;
}

export default function Breadcrumb({ items, locale }: BreadcrumbProps) {
  const params = useParams();
  const routeLocale =
    params && typeof params.locale === 'string' ? params.locale : 'en';
  const effectiveLocale = locale ?? routeLocale;
  const t = useTranslations('common.breadcrumb');

  return (
    <nav aria-label="Breadcrumb" className="py-4 px-5 sm:px-8 max-w-7xl mx-auto">
      <ol className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link href={`/${effectiveLocale}`} className="hover:text-[#00D4FF] transition-colors">
            {t('home')}
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-gray-300 dark:text-gray-500" />
            {item.href ? (
              <Link href={item.href} className="hover:text-[#00D4FF] transition-colors">
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
