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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-black/70 border border-black/15 rounded-full hover:bg-[#00D4FF]/10 hover:border-[#00D4FF]/30 hover:text-[#00D4FF] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2"
      aria-label="Language selector"
    >
      <Globe size={14} />
      {locale === 'en' ? '繁中' : 'EN'}
    </button>
  );
}
