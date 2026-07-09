'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      requestAnimationFrame(() => setShowConsent(true));
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-50"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          We use essential cookies only. No tracking.{' '}
          <Link href={`/${locale}/privacy`} className="text-[#00D4FF] hover:underline">
            Privacy Policy
          </Link>
        </p>
        <button
          onClick={handleAccept}
          className="px-4 py-2 bg-[#00D4FF] text-white rounded-full hover:bg-[#00B8E6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 min-h-[44px]"
        >
          Accept
        </button>
      </div>
    </div>
  );
}