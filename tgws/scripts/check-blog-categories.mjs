import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function check() {
  const posts = await client.fetch('*[_type == "post"] | order(publishedAt desc) { _id, title, category, coverImage }');
  
  const withImage = posts.filter(p => p.coverImage);
  const withoutImage = posts.filter(p => !p.coverImage);
  
  const categories = {};
  withoutImage.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });
  
  console.log(`Total: ${posts.length}, With image: ${withImage.length}, Without: ${withoutImage.length}`);
  console.log('Categories without image:', categories);
}

check();
