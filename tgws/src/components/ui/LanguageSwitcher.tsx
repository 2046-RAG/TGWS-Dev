'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales, Locale } from '@/i18n/config';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const currentIdx = locales.indexOf(locale);
    const newLocale = locales[(currentIdx + 1) % locales.length];
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <button
      onClick={toggleLocale}
      className="inline-flex items-center gap-1.5 px-3 py-1 text-sm text-black/80 border border-black/20 rounded-full hover:bg-black/5 transition-colors"
      aria-label="Language selector"
    >
      <Globe size={14} />
      {locale === 'en' ? '繁中' : 'EN'}
    </button>
  );
}
