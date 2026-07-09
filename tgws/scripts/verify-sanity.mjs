import https from 'https';

async function sanityQuery(query) {
  const url = `https://r6ztl1oq.api.sanity.io/v2021-10-21/data/query/production?query=${encodeURIComponent(query)}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve({ result: [] }); } });
    }).on('error', reject);
  });
}

async function main() {
  // Check products
  const products = await sanityQuery('*[_type=="product"]{title, slug, description}');
  console.log('=== PRODUCTS ===');
  for (const p of products.result || []) {
    console.log(`- ${p.title} (${p.slug?.current})`);
    console.log(`  Desc: ${(p.description || '').substring(0, 80)}...`);
  }

  // Check a case study for anonymization
  const cases = await sanityQuery('*[_type=="caseStudy"][0..2]{title}');
  console.log('\n=== CASE STUDIES (first 3) ===');
  for (const c of cases.result || []) {
    console.log(`- ${c.title}`);
  }
}

main().catch(console.error);
