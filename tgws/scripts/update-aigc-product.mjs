import https from 'https';

const PROJECT_ID = 'r6ztl1oq';
const DATASET = 'production';
const TOKEN = 'REPLACED_SANITY_TOKEN';

const NEW_DESCRIPTION = 'Want AIGC but can\'t justify the GPU investment? Access enterprise-grade text-to-video, image-to-video, text-to-image, and text-to-speech through our managed partnerships with ByteDance (Seedance, Jimeng) and Alibaba Cloud (HappyHorse, Wan, CosyVoice).';

const NEW_FEATURES = [
  'Text-to-video (Seedance, HappyHorse)',
  'Image-to-video (Seedance, HappyHorse)',
  'Text-to-image (Jimeng, Wan 2.7)',
  'Text-to-speech (CosyVoice)',
  'Managed cloud deployment'
];

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
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // Find the AIGC product
  const query = '*[_type=="product" && slug.current=="ai-generated-content-aigc"][0]{_id, title, description, features}';
  const result = await sanityRequest('GET', `/data/query/${DATASET}?query=${encodeURIComponent(query)}`);
  
  if (!result.result) {
    console.error('Product not found!');
    return;
  }

  const product = result.result;
  console.log('Found product:', product.title);
  console.log('Current description:', product.description);
  console.log('Current features:', product.features);
  console.log('');

  // Update the document
  const patchBody = {
    mutations: [{
      patch: {
        id: product._id,
        set: {
          description: NEW_DESCRIPTION,
          features: NEW_FEATURES,
        }
      }
    }]
  };

  const updateResult = await sanityRequest('POST', '/data/mutate/production', patchBody);
  console.log('Update result:', JSON.stringify(updateResult, null, 2));
}

main().catch(console.error);
