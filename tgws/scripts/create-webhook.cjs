/**
 * Sanity Webhook 创建脚本
 */

const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function createWebhook() {
  console.log('Creating Sanity Webhook...\n');

  try {
    // 使用 Sanity API 创建 webhook
    const result = await client.request({
      method: 'POST',
      uri: '/hooks',
      body: {
        name: 'Next.js Revalidation',
        url: 'https://www.techguru-it.asia/api/revalidate',
        httpMethod: 'POST',
        headers: [
          {
            key: 'x-revalidate-secret',
            value: process.env.REVALIDATE_SECRET,
          },
        ],
        filter: '_type in ["timelineEvent", "teamMember", "qualification", "product", "solution", "post", "partner", "faq"]',
      },
    });

    console.log('✅ Webhook created successfully!');
    console.log('Webhook ID:', result._id);
    return result;
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.statusCode === 401) {
      console.log('\nToken may not have webhook permissions.');
      console.log('Please create webhook manually in Sanity dashboard.');
    }
    
    return null;
  }
}

createWebhook();