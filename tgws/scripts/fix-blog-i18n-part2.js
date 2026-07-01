const { createClient } = require('next-sanity');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: envVars.SANITY_API_TOKEN
});

const titleMap = {
  'cloud-migration-failure-five-reasons': 'Cloud Migration Failure: 5 Reasons',
  'multinational-enterprise-global-branch-it-management': 'Multinational Global Branch IT Management',
  'small-business-under-100-employees-it-planning': 'IT Planning for Companies Under 100 Employees',
  'sme-cybersecurity-limited-budget-solutions': 'SME Budget Security Solutions',
  'philippines-enterprise-it-pain-points-solutions': 'Philippines Enterprise IT Challenges',
  'sd-wan-multinational-enterprise-network-optimization': 'SD-WAN for Multinational Network Optimization',
  'legacy-system-ai-enablement-methodology': 'Legacy System AI Augmentation Methodology',
  'server-virtualization-platform-selection-guide': 'Server Virtualization Platform Selection Guide',
  'nutanix-hci-philippines-finance-case-study': 'Nutanix in Philippines Finance: Case Study',
  'sangfor-asv-features-performance-review': 'Sangfor aSV Performance Review'
};

const excerptMap = {
  'cloud-migration-failure-five-reasons': 'According to Gartner, over 50% of cloud migration projects exceed budget or timeline. Five common failure reasons.',
  'multinational-enterprise-global-branch-it-management': 'From Manila to Jakarta, Bangkok to Ho Chi Minh City — unified global branch IT management.',
  'small-business-under-100-employees-it-planning': 'Companies under 100 employees do not need large IT architecture, but need a compact system plan.',
  'sme-cybersecurity-limited-budget-solutions': 'Security does not require big spending. Building effective protection on a limited budget.',
  'philippines-enterprise-it-pain-points-solutions': 'Philippines enterprises face unique IT challenges: limited budgets, talent shortages, unstable infrastructure.',
  'sd-wan-multinational-enterprise-network-optimization': 'Multinational WAN pain points: high latency, high cost, difficult management. How SD-WAN solves these.',
  'legacy-system-ai-enablement-methodology': 'No need to rebuild. A systematic methodology to inject AI capabilities into legacy systems.',
  'server-virtualization-platform-selection-guide': 'VMware ESXi, Hyper-V, Proxmox VE, Sangfor aSV — comprehensive comparison of four platforms.',
  'nutanix-hci-philippines-finance-case-study': 'How a mid-sized Philippine bank completed migration from traditional architecture to Nutanix HCI.',
  'sangfor-asv-features-performance-review': 'How does Sangfor aSV perform in real-world environments? We measure from IOPS to live migration.'
};

async function main() {
  const query = '*[_type == "post"] | order(publishedAt asc)';
  const posts = await client.fetch(query);

  console.log('Found ' + posts.length + ' posts');

  let fixed = 0;
  for (const post of posts) {
    const slug = post.slug && post.slug.current;
    const newTitle = titleMap[slug];
    const newExcerpt = excerptMap[slug];

    if (!newTitle || !newExcerpt) {
      console.log('SKIP: ' + slug);
      continue;
    }

    const chineseExcerpt = post.excerpt || '';

    const patch = client.patch(post._id).set({
      title: newTitle,
      excerpt: newExcerpt,
      excerptZh: chineseExcerpt
    });

    await patch.commit();
    fixed++;
    console.log('FIXED: ' + slug);
  }

  console.log('\nDone. Fixed ' + fixed + ' posts.');
}

main().catch(console.error);
