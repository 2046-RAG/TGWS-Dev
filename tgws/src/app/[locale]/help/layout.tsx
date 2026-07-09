import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Find answers to common questions about TechGuru products, technical support, account management, and billing.',
  openGraph: {
    title: 'Help Center | TechGuru',
    description: 'Find answers to common questions about TechGuru products, technical support, account management, and billing.',
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}