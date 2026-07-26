'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/(en|zh)/, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors text-sm"
      title={locale === 'en' ? 'Switch to 繁體中文' : 'Switch to English'}
    >
      <Globe size={16} className="text-gray-600 dark:text-gray-300" />
      <span className="text-gray-600 dark:text-gray-300 font-medium">
        {locale === 'en' ? 'EN' : '繁中'}
      </span>
    </button>
  );
}