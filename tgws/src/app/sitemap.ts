import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { client } from '@/lib/sanity.server';

const BASE_URL = 'https://www.techguru-it.asia';

const staticPages = [
  '',
  '/about',
  '/products',
  '/solutions',
  '/blog',
  '/contact',
  '/support',
  '/vmware-alternative',
  '/help',
  '/privacy',
  '/terms',
];

async function getBlogSlugs(): Promise<string[]> {
  try {
    const query = `*[_type == "post"]{ slug }`;
    const posts = await client.fetch<{ slug: { current: string } }[]>(query);
    return [...new Set(posts.map((p) => p.slug?.current).filter(Boolean))];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const blogSlugs = await getBlogSlugs();

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : 0.8,
      });
    }

    for (const slug of blogSlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
