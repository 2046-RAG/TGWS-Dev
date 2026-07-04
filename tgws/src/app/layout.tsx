import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechGuru Network & Data Solutions | Build. Run. Protect.",
  description: "Asian IT solutions integrator covering cybersecurity, network optimization, cloud computing, infrastructure, AI/AIGC, managed services, and business continuity.",
  keywords: ["IT solutions", "cybersecurity", "cloud computing", "AI", "AIGC", "managed services", "network optimization"],
  openGraph: {
    title: "TechGuru Network & Data Solutions",
    description: "Build. Run. Protect. — Your trusted IT solutions partner.",
    type: "website",
    locale: "en_US",
    alternateLocale: "zh_TW",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          // Scroll Reveal
          if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }});
            }, { threshold: 0.1 });
            setTimeout(() => {
              document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
            }, 100);
          } else {
            document.querySelectorAll('.scroll-reveal').forEach(el => el.classList.add('revealed'));
          }
          // Back to Top
          const btn = document.getElementById('back-to-top');
          if (btn) {
            window.addEventListener('scroll', () => {
              btn.classList.toggle('visible', window.scrollY > 500);
            }, { passive: true });
            btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
          }
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <button id="back-to-top" className="back-to-top" aria-label="Back to top">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      </body>
    </html>
  );
}
