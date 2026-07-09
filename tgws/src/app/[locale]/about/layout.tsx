import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about TechGuru\'s mission, team, and journey. Discover our qualifications, partnerships, and commitment to enterprise IT excellence.',
  openGraph: {
    title: 'About Us | TechGuru',
    description: 'Learn about TechGuru\'s mission, team, and journey. Discover our qualifications, partnerships, and commitment to enterprise IT excellence.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}