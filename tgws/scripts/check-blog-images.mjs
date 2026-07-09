import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function main() {
  const query = `*[_type == "post"][0..2]{
    title,
    coverImage{
      _type,
      asset->{
        _id,
        _type,
        url,
        mimeType
      }
    }
  }`;
  
  const posts = await client.fetch(query);
  console.log('Sample blog posts with coverImage:');
  posts.forEach(post => {
    console.log(`- ${post.title}:`, JSON.stringify(post.coverImage, null, 2));
  });
}

main().catch(console.error);
