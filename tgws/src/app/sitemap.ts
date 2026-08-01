import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { client } from '@/lib/sanity.server';

const BASE_URL = 'https://www.techguru-it.asia';

const staticPages = [
  '',
  '/about',
  '/about/timeline',
  '/products',
  '/products/build',
  '/products/run',
  '/products/protect',
  '/solutions',
  '/blog',
  '/contact',
  '/compare',
  '/support',
  '/support/login',
  '/support/register',
  '/profile',
  '/vmware-alternative',
  '/help',
  '/privacy',
  '/terms',
];

async function getBlogSlugs(): Promise<{ slug: string; updated?: string }[]> {
  try {
    const query = `*[_type == "post"]{ slug, _updatedAt }`;
    const posts = await client.fetch<{ slug: { current: string }; _updatedAt?: string }[]>(query);
    return [...new Map(
      posts
        .filter((p) => p.slug?.current)
        .map((p) => [p.slug.current, { slug: p.slug.current, updated: p._updatedAt }]),
    ).values()];
  } catch {
    return [];
  }
}

async function getProductSlugs(): Promise<{ slug: string; updated?: string }[]> {
  try {
    const query = `*[_type == "product"]{ slug, _updatedAt }`;
    const products = await client.fetch<{ slug: { current: string }; _updatedAt?: string }[]>(query);
    return [...new Map(
      products
        .filter((p) => p.slug?.current)
        .map((p) => [p.slug.current, { slug: p.slug.current, updated: p._updatedAt }]),
    ).values()];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const blogSlugs = await getBlogSlugs();
  const productSlugs = await getProductSlugs();

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : 0.8,
      });
    }

    for (const { slug, updated } of blogSlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: updated ? new Date(updated) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    for (const { slug, updated } of productSlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/products/${slug}`,
        lastModified: updated ? new Date(updated) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
