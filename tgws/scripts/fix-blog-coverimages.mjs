import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: `${process.env.SANITY_API_TOKEN}`,
  useCdn: false,
});

async function main() {
  // Get all posts with broken coverImage
  const query = `*[_type == "post" && defined(coverImage)]{_id, title, coverImage}`;
  const posts = await client.fetch(query);
  
  console.log(`Found ${posts.length} posts with coverImage`);
  
  for (const post of posts) {
    if (post.coverImage && !post.coverImage.asset) {
      console.log(`Removing broken coverImage from: ${post.title}`);
      await client.patch(post._id).unset(['coverImage']).commit();
    }
  }
  
  console.log('Done fixing broken coverImages');
}

main().catch(console.error);
