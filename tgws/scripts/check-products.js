const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'glaywang2046-1050s',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function getProducts() {
  const query = `*[_type == "product"] | order(category asc, order asc) {
    _id,
    title,
    slug,
    category,
    order,
    description
  }`;
  
  const products = await client.fetch(query);
  
  console.log('=== Sanity产品数据 ===');
  console.log('总数量:', products.length);
  console.log('');
  
  const grouped = {};
  products.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });
  
  Object.keys(grouped).forEach(cat => {
    console.log(`${cat.toUpperCase()} (${grouped[cat].length}个):`);
    grouped[cat].forEach((p, i) => {
      console.log(`  ${i+1}. ${p.title}`);
      console.log(`     slug: ${p.slug?.current || '无'}`);
      console.log(`     order: ${p.order || '未设置'}`);
    });
    console.log('');
  });
}

getProducts().catch(console.error);
