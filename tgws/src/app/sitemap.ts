import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { client } from '@/lib/sanity.server';

const BASE_URL = 'https://www.techguru-it.asia';

const staticPages = [
  '',
  '/about',
  '/products',
  '/products/build',
  '/products/run',
  '/products/protect',
  '/solutions',
  '/blog',
  '/contact',
  '/support',
  '/compare',
  '/vmware-alternative',
  '/help',
  '/privacy',
  '/terms',
];

async function getBlogSlugs(): Promise<{ slug: string; lastModified: string }[]> {
  try {
    const query = `*[_type == "post"]{ slug, publishedAt }`;
    const posts = await client.fetch<
      { slug: { current: string } | null; publishedAt: string | null }[]
    >(query);
    const seen = new Set<string>();
    const result: { slug: string; lastModified: string }[] = [];
    for (const p of posts) {
      const slug = p.slug?.current;
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      result.push({
        slug,
        lastModified: p.publishedAt ?? new Date().toISOString(),
      });
    }
    return result;
  } catch {
    return [];
  }
}

async function getProductSlugs(): Promise<{ slug: string; lastModified: string }[]> {
  try {
    const query = `*[_type == "product"]{ slug, _updatedAt }`;
    const products = await client.fetch<
      { slug: { current: string } | null; _updatedAt: string | null }[]
    >(query);
    const seen = new Set<string>();
    const result: { slug: string; lastModified: string }[] = [];
    for (const p of products) {
      const slug = p.slug?.current;
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      result.push({
        slug,
        lastModified: p._updatedAt ?? new Date().toISOString(),
      });
    }
    return result;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const [blogSlugs, productSlugs] = await Promise.all([
    getBlogSlugs(),
    getProductSlugs(),
  ]);

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : 0.8,
      });
    }

    for (const product of productSlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/products/${product.slug}`,
        lastModified: new Date(product.lastModified),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }

    for (const blog of blogSlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${blog.slug}`,
        lastModified: new Date(blog.lastModified),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
