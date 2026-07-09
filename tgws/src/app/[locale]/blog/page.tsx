import { client } from '@/lib/sanity';
import BlogList from './BlogList';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest insights on enterprise networking, cybersecurity, cloud infrastructure, and IT best practices from TechGuru experts.',
  openGraph: {
    title: 'Blog | TechGuru',
    description: 'Latest insights on enterprise networking, cybersecurity, cloud infrastructure, and IT best practices from TechGuru experts.',
  },
};

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