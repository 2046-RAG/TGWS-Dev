import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';

const BASE_URL = 'https://www.techguru-it.asia';

const staticPages = [
  '',
  '/about',
  '/products',
  '/solutions',
  '/case-studies',
  '/blog',
  '/contact',
  '/support',
  '/vmware-alternative',
  '/help',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : 0.8,
      });
    }
  }

  return entries;
}
