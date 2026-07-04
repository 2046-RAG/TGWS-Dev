import { client } from '@/lib/sanity';
import BlogList from './BlogList';

export const revalidate = 3600;

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
      mainImage,
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
  return <BlogList posts={posts} />;
}