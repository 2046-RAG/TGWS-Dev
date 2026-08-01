import https from 'https';

const PROJECT_ID = 'r6ztl1oq';
const DATASET = 'production';
const TOKEN = `${process.env.SANITY_API_TOKEN}`;

const newProduct = {
  _type: 'product',
  title: 'AI Adoption Services',
  slug: { _type: 'slug', current: 'ai-adoption-services' },
  category: 'build',
  description: "Not sure where AI fits in your organization? Start here. We assess your readiness, identify the highest-impact use cases, and build a 90-day roadmap. From there, we guide you into the right specialized solution — AIGC for content, AI Coding for development, or Legacy System AI for modernization.",
  descriptionZh: "不確定AI該從哪裡開始？從這裡開始。我們評估您的準備度、識別最高價值場景、制定90天路線圖。然後引導您進入合適的專業方案——AIGC做內容、AI Coding做開發、Legacy System AI做現代化。",
  features: ["AI readiness assessment", "Use case identification", "Platform selection & PoC", "Team training & enablement", "Organization-wide rollout"],
  order: 1
};

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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const createBody = {
    mutations: [{
      create: newProduct
    }]
  };

  const result = await sanityRequest('POST', '/data/mutate/production', createBody);
  console.log('Created AI Adoption product:', JSON.stringify(result, null, 2));
}

main().catch(console.error);
