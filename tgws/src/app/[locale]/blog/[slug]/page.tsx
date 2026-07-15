import { client } from '@/lib/sanity.server';
import { notFound } from 'next/navigation';
import BlogDetail from './BlogDetail';
import type { Metadata } from 'next';

export const revalidate = 3600;

async function getPost(slug: string) {
  try {
    const query = `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      titleZh,
      slug,
      category,
      excerpt,
      excerptZh,
      content,
      contentZh,
      author,
      publishedAt,
      featured,
      coverImage,
      tags,
      architectureDiagram
    }`;
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };
  const rawTitle = locale === 'zh' ? (post.titleZh || post.title) : post.title;
  const rawDesc = locale === 'zh' ? (post.excerptZh || post.excerpt) : post.excerpt;
  const title = typeof rawTitle === 'object' ? (rawTitle.en || rawTitle.zh || Object.values(rawTitle)[0] || '') : rawTitle;
  const description = typeof rawDesc === 'object' ? (rawDesc.en || rawDesc.zh || Object.values(rawDesc)[0] || '') : rawDesc;
  // OG image: use coverImage if Sanity object, else picsum fallback
  const ogImage = post.coverImage && typeof post.coverImage === 'object'
    ? `https://cdn.sanity.io/images/r6ztl1oq/production/${post.coverImage.asset?._ref?.replace('image-', '').replace('-$', '.') || 'fallback'}.png`
    : `https://picsum.photos/seed/${slug}/1200/630`;
  return {
    title: String(title),
    description: String(description),
    openGraph: {
      title: String(title),
      description: String(description),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: String(title),
      description: String(description),
      images: [ogImage],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <BlogDetail post={post} locale={locale} />;
}