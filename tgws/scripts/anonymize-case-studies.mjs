import https from 'https';

const PROJECT_ID = 'r6ztl1oq';
const DATASET = 'production';
const TOKEN = 'REPLACED_SANITY_TOKEN';

const nameMap = {
  'BDO Unibank': '某大型商业银行',
  'BDO': '某大型商业银行',
  'Metrobank': '某主要商业银行',
  'AXA Philippines': '某国际保险集团',
  'AXA': '某国际保险集团',
  'UnionBank': '某数字化银行',
  'GCash': '某主流移动支付平台',
  'Mynt': '某金融科技公司',
  'SM Retail': '某大型零售集团',
  'Robinsons Retail': '某零售连锁集团',
  'Jollibee Foods': '某跨国餐饮集团',
  'Jollibee': '某跨国餐饮集团',
  'Bench': '某知名服饰品牌',
  'Suyen Corp': '某消费品公司',
  'Philippine General Hospital': '某大型公立医院',
  "St. Luke's Medical Center": '某知名医疗中心',
  "St. Luke's": '某知名医疗中心',
  'X銀行': '某银行',
  'X银行': '某银行',
};

async function sanityQuery(query) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve({ result: [] }); } });
    }).on('error', reject);
  });
}

async function sanityMutate(body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${PROJECT_ID}.api.sanity.io`,
      path: `/v2021-10-21/data/mutate/${DATASET}`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function replaceInText(text) {
  if (typeof text !== 'string') return text;
  let result = text;
  for (const [real, fake] of Object.entries(nameMap)) {
    result = result.split(real).join(fake);
  }
  return result;
}

function processPortableText(blocks) {
  if (!Array.isArray(blocks)) return blocks;
  let changed = false;
  const processed = blocks.map(block => {
    if (block._type === 'block' && Array.isArray(block.children)) {
      const newChildren = block.children.map(child => {
        if (child._type === 'span' && typeof child.text === 'string') {
          const newText = replaceInText(child.text);
          if (newText !== child.text) changed = true;
          return { ...child, text: newText };
        }
        return child;
      });
      return { ...block, children: newChildren };
    }
    return block;
  });
  return changed ? processed : blocks;
}

async function main() {
  // Case studies
  const caseResult = await sanityQuery('*[_type=="caseStudy"]{_id, title, content, contentZh}');
  const cases = caseResult.result || [];
  console.log(`Found ${cases.length} case studies`);

  let updated = 0;
  for (const c of cases) {
    const newTitle = replaceInText(c.title);
    const newContent = processPortableText(c.content);
    const newContentZh = processPortableText(c.contentZh);

    const contentChanged = newContent !== c.content;
    const contentZhChanged = newContentZh !== c.contentZh;
    const titleChanged = newTitle !== c.title;

    if (titleChanged || contentChanged || contentZhChanged) {
      const patch = {};
      if (titleChanged) patch.title = newTitle;
      if (contentChanged) patch.content = newContent;
      if (contentZhChanged) patch.contentZh = newContentZh;

      await sanityMutate({ mutations: [{ patch: { id: c._id, set: patch } }] });
      console.log(`Fixed: ${c.title.substring(0, 50)}`);
      updated++;
    }
  }

  // Blog posts
  const postResult = await sanityQuery('*[_type=="post"]{_id, title, content, contentZh}');
  const posts = postResult.result || [];
  console.log(`\nFound ${posts.length} blog posts`);

  for (const p of posts) {
    const newTitle = replaceInText(p.title);
    const newContent = processPortableText(p.content);
    const newContentZh = processPortableText(p.contentZh);

    const contentChanged = newContent !== p.content;
    const contentZhChanged = newContentZh !== p.contentZh;
    const titleChanged = newTitle !== p.title;

    if (titleChanged || contentChanged || contentZhChanged) {
      const patch = {};
      if (titleChanged) patch.title = newTitle;
      if (contentChanged) patch.content = newContent;
      if (contentZhChanged) patch.contentZh = newContentZh;

      await sanityMutate({ mutations: [{ patch: { id: p._id, set: patch } }] });
      console.log(`Fixed blog: ${p.title.substring(0, 50)}`);
      updated++;
    }
  }

  console.log(`\nTotal anonymized: ${updated}`);
}

main().catch(console.error);
