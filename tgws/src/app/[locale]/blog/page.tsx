import { client } from '@/lib/sanity';
import BlogList from './BlogList';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog.metadata' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

async function getPosts() {
  try {
    const query = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      titleZh,
      slug,
      category,
      excerpt,
      excerptZh,
      author,
      publishedAt,
      featured,
      coverImage,
      tags
    }`;
    const posts = await client.fetch(query);
    return posts || [];
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <Breadcrumb items={[{ label: 'Blog' }]} />
      <BlogList posts={posts} />
    </>
  );
}