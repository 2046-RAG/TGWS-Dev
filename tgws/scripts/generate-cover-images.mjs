import https from 'https';
import { readFileSync } from 'fs';

const PROJECT_ID = 'r6ztl1oq';
const DATASET = 'production';
const TOKEN = `${process.env.SANITY_API_TOKEN}`;

const categoryColors = {
  technical: { bg: '#1a1a2e', text: '#00D4FF', accent: '#16213e' },
  news: { bg: '#0f3460', text: '#e94560', accent: '#16213e' },
  industry: { bg: '#1b1b2f', text: '#7B61FF', accent: '#162447' },
  'case-study': { bg: '#1a1a1a', text: '#22C55E', accent: '#2d2d2d' },
};

function generateSVG(title, category) {
  const colors = categoryColors[category] || categoryColors.technical;
  const shortTitle = title.length > 40 ? title.substring(0, 37) + '...' : title;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg}"/>
      <stop offset="100%" style="stop-color:${colors.accent}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="60" y="280" width="100" height="4" fill="${colors.text}" rx="2"/>
  <text x="60" y="340" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white">${shortTitle}</text>
  <text x="60" y="400" font-family="Arial, sans-serif" font-size="18" fill="${colors.text}" text-transform="uppercase">${category.toUpperCase()}</text>
  <text x="60" y="540" font-family="Arial, sans-serif" font-size="14" fill="#666">TechGuru Network & Data Solutions</text>
  <circle cx="1100" cy="100" r="200" fill="${colors.text}" opacity="0.05"/>
  <circle cx="1150" cy="150" r="150" fill="${colors.text}" opacity="0.03"/>
</svg>`;
}

async function sanityRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${PROJECT_ID}.api.sanity.io`,
      path: `/v2021-10-21${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
    });
    req.on('error', reject);
    if (body) {
      if (Buffer.isBuffer(body)) {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

async function uploadImage(svgContent, filename) {
  // Convert SVG to buffer
  const buffer = Buffer.from(svgContent, 'utf-8');
  
  // Upload to Sanity
  const boundary = '----FormBoundary' + Date.now();
  const bodyParts = [];
  
  // File data
  bodyParts.push(`--${boundary}\r\n`);
  bodyParts.push(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`);
  bodyParts.push(`Content-Type: image/svg+xml\r\n\r\n`);
  
  const header = Buffer.from(bodyParts.join(''));
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const fullBody = Buffer.concat([header, buffer, footer]);
  
  const result = await sanityRequest('POST', '/assets/images', fullBody);
  return result.documentId || result._id;
}

async function main() {
  // Get all blog posts
  const query = '*[_type=="post"]{_id, title, slug, category}';
  const result = await sanityRequest('GET', `/data/query/${DATASET}?query=${encodeURIComponent(query)}`);
  const posts = result.result || [];
  
  console.log(`Found ${posts.length} blog posts`);
  
  for (const post of posts) {
    if (post.coverImage) {
      console.log(`Skipping ${post.title} (already has coverImage)`);
      continue;
    }
    
    console.log(`Generating cover for: ${post.title}`);
    const svg = generateSVG(post.title, post.category || 'technical');
    const filename = `${post.slug.current}.svg`;
    
    try {
      const imageId = await uploadImage(svg, filename);
      console.log(`  Uploaded: ${imageId}`);
      
      // Patch the post with the cover image
      const patchBody = {
        mutations: [{
          patch: {
            id: post._id,
            set: {
              coverImage: {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: imageId,
                },
              },
            },
          },
        }],
      };
      
      const patchResult = await sanityRequest('POST', '/data/mutate/production', patchBody);
      console.log(`  Patched: ${patchResult.transactionId}`);
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }
  
  console.log('\nDone!');
}

main().catch(console.error);
