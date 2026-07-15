import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const query = `*[_type == "product"] | order(category asc, order asc) {
  _id, title, slug, category, subcategory, order,
  description, descriptionZh, features
}`;

const products = await client.fetch(query);
console.log('Total products:', products.length);

const byCategory = {};
products.forEach(p => {
  if (!byCategory[p.category]) byCategory[p.category] = [];
  byCategory[p.category].push(p);
});

for (const [cat, items] of Object.entries(byCategory)) {
  console.log(`\n${cat.toUpperCase()} (${items.length}):`);
  items.forEach(p => console.log(`  [${p.order}] ${p.title} (slug: ${p.slug?.current}, sub: ${p.subcategory || 'none'})`));
}
