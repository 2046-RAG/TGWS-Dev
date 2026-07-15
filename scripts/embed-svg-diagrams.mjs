import fs from 'fs';

const envContent = fs.readFileSync('D:\\软件集\\Mimo\\WorkSpace\\TGWS\\tgws\\.env.local', 'utf8');
const tokenLine = envContent.split('\n').find(l => l.includes('SANITY_API_TOKEN='));
const token = tokenLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const projectId = 'r6ztl1oq';
const dataset = 'production';

const sanityMutate = async (mutations) => {
  const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/mutate/${dataset}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  });
  return res.json();
};

// SVG filename → blog slug mapping
const svgToSlug = {
  'ai-adoption.svg': 'enterprise-ai-strategy-poc-production',
  'cloud-migration.svg': 'cloud-migration-6r-approach',
  'disaster-recovery.svg': 'vmware-srm-disaster-recovery-guide',
  'edr-xdr.svg': 'edr-xdr-mdr-comparison',
  'fortigate-deployment.svg': 'fortigate-ngfw-deployment-architecture',
  'hci-architecture.svg': 'nutanix-hci-healthcare-architecture',
  'hybrid-cloud.svg': 'hybrid-cloud-architecture-guide',
  'network-segmentation.svg': 'network-segmentation-best-practices',
  'sdwan-architecture.svg': 'sdwan-multibranch-retail-design',
  'zero-trust.svg': 'zero-trust-network-implementation',
};

console.log('Embedding SVG diagrams into blog posts...\n');

const updates = Object.entries(svgToSlug).map(([svg, slug]) => ({
  svg,
  slug,
}));

let updated = 0;
let failed = 0;

for (const { svg, slug } of updates) {
  // Find the post ID by slug
  const queryUrl = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent(`*[_type=="post" && slug.current=="${slug}"][0]{_id}`)}`;
  const res = await fetch(queryUrl, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();

  if (!data.result?._id) {
    console.log(`❌ No post found for slug: ${slug}`);
    failed++;
    continue;
  }

  const postId = data.result._id;
  const result = await sanityMutate([{
    patch: {
      id: postId,
      set: { architectureDiagram: svg }
    }
  }]);

  if (result.results) {
    console.log(`✅ ${svg} → ${slug} (${postId})`);
    updated++;
  } else {
    console.log(`❌ Failed: ${svg} → ${slug} -`, JSON.stringify(result).substring(0, 200));
    failed++;
  }
}

console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);
