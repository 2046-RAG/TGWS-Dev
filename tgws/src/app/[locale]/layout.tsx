import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n/config';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/ui/CookieConsent';
import { OrganizationJsonLd } from '@/components/ui/JsonLd';
import ScrollToTop from '@/components/ui/ScrollToTop';
import ScrollReveal from '@/components/ui/ScrollReveal';
import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'TechGuru | Network & Data Solutions',
    template: '%s | TechGuru',
  },
  description:
    'Enterprise network infrastructure, cybersecurity, and data solutions. Build, run, and protect your IT environment with TechGuru.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'TechGuru',
    title: 'TechGuru | Network & Data Solutions',
    description:
      'Enterprise network infrastructure, cybersecurity, and data solutions. Build, run, and protect your IT environment with TechGuru.',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://db.onlinewebfonts.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
        <link rel="dns-prefetch" href="https://d8j0ntlcm91z4.cloudfront.net" />
        <link rel="preload" href="https://db.onlinewebfonts.com/c/5ac3fe7c6abd2f62067f266d89671492?family=HelveticaNowDisplay-Medium" as="style" crossOrigin="anonymous" />
        <link rel="preload" href="https://db.onlinewebfonts.com/c/1aa3377e489837a26d019bba501e779d?family=HelveticaNowDisplayW01-Rg" as="style" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://db.onlinewebfonts.com/c/5ac3fe7c6abd2f62067f266d89671492?family=HelveticaNowDisplay-Medium" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://db.onlinewebfonts.com/c/1aa3377e489837a26d019bba501e779d?family=HelveticaNowDisplayW01-Rg" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) document.documentElement.classList.add('dark');
                } catch(e) {}
              })();
              document.documentElement.classList.add('js-loaded');
              if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
                var observer = new IntersectionObserver(function(entries) {
                  entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }});
                }, { threshold: 0.1 });
                setTimeout(function() {
                  document.querySelectorAll('.scroll-reveal').forEach(function(el) { observer.observe(el); });
                }, 100);
              } else {
                document.querySelectorAll('.scroll-reveal').forEach(function(el) { el.classList.add('revealed'); });
              }
              var btn = document.getElementById('back-to-top');
              if (btn) {
                window.addEventListener('scroll', function() {
                  btn.classList.toggle('visible', window.scrollY > 500);
                }, { passive: true });
                btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
              }
            `,
          }}
        />
      </head>
      <body className="bg-[#F4F4F5] dark:bg-[#09090B] text-gray-900 dark:text-gray-100 min-h-screen transition-colors">
        <NextIntlClientProvider messages={messages}>
          <ScrollToTop />
          <ScrollReveal />
          <OrganizationJsonLd />
          <Navbar />
          <main className="pt-[73px]">{children}</main>
          <Footer />
          <CookieConsent />
          <button id="back-to-top" className="back-to-top" aria-label="Back to top">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
