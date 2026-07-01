import { client } from '@/lib/sanity.server';
import { notFound } from 'next/navigation';
import BlogDetail from './BlogDetail';
import type { Metadata } from 'next';

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
      mainImage,
      tags
    }`;
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: post.title,
    description: post.excerpt
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <BlogDetail post={post} locale={locale} />;
}