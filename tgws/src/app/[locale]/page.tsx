import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TechGuru | Enterprise IT Solutions',
  description:
    'Build, run, and protect your enterprise IT infrastructure. TechGuru provides network, cybersecurity, and data solutions for businesses.',
  openGraph: {
    title: 'TechGuru | Enterprise IT Solutions',
    description:
      'Build, run, and protect your enterprise IT infrastructure. TechGuru provides network, cybersecurity, and data solutions for businesses.',
    type: 'website',
  },
};

export { default } from './home/page';
