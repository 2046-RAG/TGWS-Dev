import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with TechGuru for enterprise IT solutions. Reach our offices in Taipei and Hong Kong, or send us an inquiry.',
  openGraph: {
    title: 'Contact Us | TechGuru',
    description: 'Get in touch with TechGuru for enterprise IT solutions. Reach our offices in Taipei and Hong Kong, or send us an inquiry.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}