import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function main() {
  const query = `*[_type == "solution"] | order(industry asc, title asc) {
    _id,
    title,
    slug,
    industry,
    description,
    descriptionZh,
    challenges,
    recommendedProducts,
    image
  }`;
  
  try {
    const solutions = await client.fetch(query);
    console.log(`Found ${solutions.length} solutions`);
    if (solutions.length > 0) {
      console.log('First solution:', JSON.stringify(solutions[0], null, 2));
    }
  } catch (error) {
    console.error('Query error:', error.message);
  }
}

main().catch(console.error);
