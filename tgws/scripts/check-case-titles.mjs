import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function check() {
  const cs = await client.fetch('*[_type == "caseStudy"] | order(industry asc) { _id, title, clientName, summary }');

  console.log('=== Titles with Chinese characters ===');
  let count = 0;
  cs.forEach(c => {
    // Check if title contains Chinese characters
    if (/[\u4e00-\u9fff]/.test(c.title)) {
      count++;
      console.log(`  [${c._id.substring(0,8)}] ${c.title}`);
    }
  });
  console.log(`\nTotal with Chinese in title: ${count}/${cs.length}`);

  console.log('\n=== Client names with Chinese characters ===');
  let clientCount = 0;
  cs.forEach(c => {
    if (/[\u4e00-\u9fff]/.test(c.clientName)) {
      clientCount++;
      console.log(`  [${c._id.substring(0,8)}] ${c.clientName}`);
    }
  });
  console.log(`\nTotal with Chinese in clientName: ${clientCount}/${cs.length}`);

  console.log('\n=== Summaries with mixed language ===');
  let summaryCount = 0;
  cs.forEach(c => {
    if (c.summary && /[\u4e00-\u9fff]/.test(c.summary)) {
      summaryCount++;
    }
  });
  console.log(`Total with Chinese in summary: ${summaryCount}/${cs.length}`);
}

check();
