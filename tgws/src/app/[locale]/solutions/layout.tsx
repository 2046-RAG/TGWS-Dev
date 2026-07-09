import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industry Solutions',
  description: 'Tailored IT solutions for healthcare, finance, retail, logistics, education, and government sectors. Address unique industry challenges with TechGuru.',
  openGraph: {
    title: 'Industry Solutions | TechGuru',
    description: 'Tailored IT solutions for healthcare, finance, retail, logistics, education, and government sectors. Address unique industry challenges with TechGuru.',
  },
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}