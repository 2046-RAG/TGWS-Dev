import https from 'https';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROJECT_ID = 'r6ztl1oq';
const DATASET = 'production';
const TOKEN = 'REPLACED_SANITY_TOKEN';

// Read architecture templates
const templatesPath = resolve(process.cwd(), 'architecture-templates.json');
const templatesData = JSON.parse(readFileSync(templatesPath, 'utf-8'));
const templates = templatesData.architectureTemplates;

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

async function findExistingCaseStudy(slug) {
  const query = `*[_type=="caseStudy" && slug.current=="${slug}"][0]._id`;
  const result = await sanityRequest('GET', `/data/query/${DATASET}?query=${encodeURIComponent(query)}`);
  return result.result || null;
}

function templateToSanityContent(template) {
  // Build content blocks from solution architecture
  const blocks = [];
  
  // Business Challenge
  blocks.push({
    _type: 'block',
    _key: 'challenge',
    style: 'h3',
    children: [{ _type: 'span', text: 'Business Challenge' }]
  });
  blocks.push({
    _type: 'block',
    _key: 'challenge-text',
    children: [{ _type: 'span', text: template.businessChallenge }]
  });

  // Solution Architecture
  blocks.push({
    _type: 'block',
    _key: 'solution',
    style: 'h3',
    children: [{ _type: 'span', text: 'Solution Architecture' }]
  });
  blocks.push({
    _type: 'block',
    _key: 'solution-overview',
    children: [{ _type: 'span', text: template.solutionArchitecture.overview }]
  });

  // Components
  blocks.push({
    _type: 'block',
    _key: 'components-title',
    style: 'h4',
    children: [{ _type: 'span', text: 'Infrastructure Components' }]
  });

  for (const comp of template.solutionArchitecture.components) {
    blocks.push({
      _type: 'block',
      _key: `comp-${comp.layer}`,
      children: [
        { _type: 'span', marks: ['strong'], text: `${comp.vendor} ${comp.product}` },
        { _type: 'span', text: ` — ${comp.role}. ${comp.specification}` }
      ]
    });
  }

  // Architecture Diagram
  blocks.push({
    _type: 'block',
    _key: 'arch-title',
    style: 'h4',
    children: [{ _type: 'span', text: 'Architecture Overview' }]
  });
  blocks.push({
    _type: 'block',
    _key: 'arch-desc',
    children: [{ _type: 'span', text: template.solutionArchitecture.architectureDiagram.description }]
  });
  blocks.push({
    _type: 'block',
    _key: 'arch-flow',
    children: [
      { _type: 'span', marks: ['strong'], text: 'Data Flow: ' },
      { _type: 'span', text: template.solutionArchitecture.architectureDiagram.dataFlow }
    ]
  });

  // Key Benefits
  blocks.push({
    _type: 'block',
    _key: 'benefits-title',
    style: 'h3',
    children: [{ _type: 'span', text: 'Key Benefits' }]
  });

  for (const benefit of template.keyBenefits) {
    blocks.push({
      _type: 'block',
      _key: `benefit-${benefit.metric}`,
      listItem: 'bullet',
      children: [
        { _type: 'span', marks: ['strong'], text: `${benefit.value} ` },
        { _type: 'span', text: benefit.description }
      ]
    });
  }

  return blocks;
}

async function main() {
  console.log(`Processing ${templates.length} architecture templates...\n`);

  for (const template of templates) {
    console.log(`--- ${template.title} ---`);
    
    const existingId = await findExistingCaseStudy(template.slug);
    
    const sanityDoc = {
      _type: 'caseStudy',
      title: template.title,
      slug: { _type: 'slug', current: template.slug },
      industry: template.industry,
      clientName: `${template.industry} sector client`,
      summary: template.solutionArchitecture.overview,
      summaryZh: template.solutionArchitecture.overview, // TODO: translate
      content: templateToSanityContent(template),
      productsUsed: template.solutionArchitecture.components.map(c => `${c.vendor} ${c.product}`),
      results: template.keyBenefits.map(b => `${b.value} ${b.description}`),
      publishedAt: new Date().toISOString(),
    };

    if (existingId) {
      // Update existing
      const patchBody = {
        mutations: [{
          patch: {
            id: existingId,
            set: sanityDoc,
          }
        }]
      };
      const result = await sanityRequest('POST', '/data/mutate/production', patchBody);
      console.log(`  Updated: ${result.transactionId}`);
    } else {
      // Create new
      const createBody = {
        mutations: [{
          create: sanityDoc,
        }]
      };
      const result = await sanityRequest('POST', '/data/mutate/production', createBody);
      console.log(`  Created: ${result.documentIds}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
