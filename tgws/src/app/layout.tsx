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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
