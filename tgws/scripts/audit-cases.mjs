import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function audit() {
  const cs = await client.fetch(`*[_type == "caseStudy"] | order(industry asc) {
    _id, title, industry, clientName, summary, coverImage, productsUsed, content, results
  }`);

  console.log('Total case studies:', cs.length);

  let noImage = 0, noSummary = 0, noContent = 0, noProducts = 0, noResults = 0, noClient = 0;
  const byIndustry = {};
  const genericTitles = [];

  cs.forEach(c => {
    if (!c.coverImage) noImage++;
    if (!c.summary) noSummary++;
    if (!c.content || c.content.length === 0) noContent++;
    if (!c.productsUsed || c.productsUsed.length === 0) noProducts++;
    if (!c.results || c.results.length === 0) noResults++;
    if (!c.clientName) noClient++;
    byIndustry[c.industry] = (byIndustry[c.industry] || 0) + 1;
    if (c.title && (c.title.includes('sector client') || c.title.includes('某某'))) {
      genericTitles.push(c.title);
    }
  });

  console.log('\n=== Data Quality ===');
  console.log('Missing coverImage:', noImage);
  console.log('Missing summary:', noSummary);
  console.log('Missing content:', noContent);
  console.log('Missing productsUsed:', noProducts);
  console.log('Missing results:', noResults);
  console.log('Missing clientName:', noClient);
  console.log('\n=== By Industry ===');
  Object.entries(byIndustry).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log('\n=== Generic/Anonymized Titles ===');
  genericTitles.forEach(t => console.log('  -', t));
}

audit();
