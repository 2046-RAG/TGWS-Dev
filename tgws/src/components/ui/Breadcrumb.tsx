'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items, locale = 'en' }: { items: BreadcrumbItem[]; locale?: string }) {
  const homeLabel = locale === 'zh' ? '首頁' : 'Home';
  return (
    <nav aria-label="Breadcrumb" className="py-4 px-5 sm:px-8 max-w-7xl mx-auto">
      <ol className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link href={`/${locale}`} className="hover:text-[#00D4FF] transition-colors">
            {homeLabel}
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
