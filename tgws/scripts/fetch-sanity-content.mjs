import https from 'https';

const PROJECT_ID = 'r6ztl1oq';
const DATASET = 'production';
const BASE_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}`;

async function groqQuery(query) {
  const url = `${BASE_URL}?query=${encodeURIComponent(query)}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${data.substring(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const queries = [
    { name: 'Products', query: '*[_type=="product"] | order(category asc, order asc){title, slug, category, subcategory, description, descriptionZh, features}' },
    { name: 'Solutions', query: '*[_type=="solution"]{title, slug, description, descriptionZh}' },
    { name: 'Case Studies', query: '*[_type=="caseStudy"]{title, slug, industry, summary, summaryZh, content, contentZh}' },
    { name: 'Blog Posts', query: '*[_type=="post"]|order(publishedAt desc){title, slug, excerpt, excerptZh, content, contentZh, category, author}' },
  ];

  const results = {};
  for (const q of queries) {
    const result = await groqQuery(q.query);
    results[q.name] = result.result || [];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${q.name} (${results[q.name].length} documents)`);
    console.log('='.repeat(60));
    results[q.name].forEach((doc, i) => {
      console.log(`\n--- [${i + 1}] ${doc.title} ---`);
      console.log(`  slug: ${doc.slug?.current || 'N/A'}`);
      if (doc.category) console.log(`  category: ${doc.category}`);
      if (doc.subcategory) console.log(`  subcategory: ${doc.subcategory}`);
      if (doc.industry) console.log(`  industry: ${doc.industry}`);
      if (doc.author) console.log(`  author: ${doc.author}`);
      if (doc.excerpt) console.log(`  excerpt (en): ${doc.excerpt}`);
      if (doc.excerptZh) console.log(`  excerpt (zh): ${doc.excerptZh}`);
      if (doc.summary) console.log(`  summary (en): ${doc.summary}`);
      if (doc.summaryZh) console.log(`  summary (zh): ${doc.summaryZh}`);
      if (doc.description) console.log(`  description (en): ${doc.description}`);
      if (doc.descriptionZh) console.log(`  description (zh): ${doc.descriptionZh}`);
      if (doc.features) console.log(`  features: ${JSON.stringify(doc.features)}`);
      if (doc.content) {
        const preview = typeof doc.content === 'string' ? doc.content.substring(0, 300) : JSON.stringify(doc.content).substring(0, 300);
        console.log(`  content (en, preview): ${preview}...`);
      }
      if (doc.contentZh) {
        const preview = typeof doc.contentZh === 'string' ? doc.contentZh.substring(0, 300) : JSON.stringify(doc.contentZh).substring(0, 300);
        console.log(`  content (zh, preview): ${preview}...`);
      }
    });
  }
}

main().catch(console.error);
