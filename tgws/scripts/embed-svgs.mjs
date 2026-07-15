import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const b = (t, s='normal') => ({_type:'block',style:s,children:[{_type:'span',text:t}]});
const h2 = t => b(t,'h2');
const p = t => b(t);

// Map article slugs to SVG files
const svgMap = {
  'what-is-hci-beginners-guide': 'hci-architecture',
  'zero-trust-network-implementation': 'zero-trust',
  'fortigate-ngfw-deployment-architecture': 'fortigate-deployment',
  'vmware-srm-disaster-recovery-guide': 'disaster-recovery',
  'dr-site-design-active-passive': 'disaster-recovery',
  'sdwan-multibranch-retail-design': 'sdwan-architecture',
  'what-is-ai-agent-architecture': 'ai-adoption',
  'what-is-aigc-enterprise-guide': 'ai-adoption',
  'edr-crowdstrike-sentinelone-sangfor': 'edr-xdr',
  'edr-xdr-mdr-comparison': 'edr-xdr',
  'cloud-migration-6r-approach': 'cloud-migration',
  'hybrid-cloud-architecture-guide': 'hybrid-cloud',
  'network-segmentation-best-practices': 'network-segmentation',
};

// Get all posts
const posts = await client.fetch('*[_type=="post"]{_id,slug,content}');

let updated = 0;
for (const post of posts) {
  const slug = post.slug?.current;
  const svgFile = svgMap[slug];
  if (!svgFile) continue;

  // Check if SVG already embedded
  const contentStr = JSON.stringify(post.content || []);
  if (contentStr.includes('/images/blog/' + svgFile + '.svg')) continue;

  // Add SVG image block at the beginning of content (after first H2)
  const svgBlock = {
    _type: 'image',
    asset: { _ref: `image-file-${svgFile}` },
    alt: `${svgFile.replace(/-/g, ' ')} architecture diagram`,
  };

  // Find insertion point (after first H2 or at beginning)
  const content = post.content || [];
  let insertIdx = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i]._type === 'block' && content[i].style === 'h2') {
      insertIdx = i + 1;
      break;
    }
  }

  // Insert SVG reference as a text block with image URL
  const newContent = [
    ...content.slice(0, insertIdx),
    p(`[Architecture Diagram: /images/blog/${svgFile}.svg]`),
    ...content.slice(insertIdx),
  ];

  try {
    await client.patch(post._id).set({ content: newContent }).commit();
    console.log(`✅ ${slug}: embedded ${svgFile}.svg`);
    updated++;
  } catch(e) {
    console.error(`❌ ${slug}: ${e.message}`);
  }
}

console.log(`\nUpdated: ${updated} articles with SVG diagrams`);
