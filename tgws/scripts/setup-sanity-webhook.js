/**
 * Sanity Webhook 配置脚本
 * 用于设置实时同步：Sanity数据更新 → 自动触发Next.js重新生成页面
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

// Webhook配置
const webhookConfig = {
  name: 'Next.js Revalidation',
  description: 'Trigger Next.js ISR revalidation when content changes',
  url: 'https://www.techguru-it.asia/api/revalidate',
  httpMethod: 'POST',
  headers: [
    {
      key: 'x-revalidate-secret',
      value: process.env.REVALIDATE_SECRET,
    },
    {
      key: 'Content-Type',
      value: 'application/json',
    },
  ],
  // 监听的文档类型
  filter: '_type in ["timelineEvent", "teamMember", "qualification", "product", "solution", "post", "partner", "faq"]',
  // 发送的payload
  payload: '{"_type": "${_type}", "_id": "${_id}"}',
  // 失败时的API版本
  apiVersion: 'v2024-01-01',
};

async function setupWebhook() {
  console.log('Setting up Sanity Webhook for Next.js revalidation...\n');

  try {
    // 检查是否已存在webhook
    const existingWebhooks = await client.request({
      method: 'GET',
      uri: '/hooks',
      query: { query: '*[_type == "sanity.webhook"]' },
    });

    console.log('Existing webhooks:', existingWebhooks.length);

    // 创建新的webhook
    const result = await client.request({
      method: 'POST',
      uri: '/hooks',
      body: webhookConfig,
    });

    console.log('\n✅ Webhook created successfully!');
    console.log('Webhook ID:', result._id);
    console.log('URL:', webhookConfig.url);
    console.log('\nMonitored document types:');
    console.log('  - timelineEvent');
    console.log('  - teamMember');
    console.log('  - qualification');
    console.log('  - product');
    console.log('  - solution');
    console.log('  - post');
    console.log('  - partner');
    console.log('  - faq');

    return result;
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    
    // 如果API不支持直接创建，提供手动配置说明
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Go to https://www.sanity.io/manage');
    console.log('2. Select your project: TechGuru CMS');
    console.log('3. Go to API → Webhooks');
    console.log('4. Create a new webhook with:');
    console.log('   - Name: Next.js Revalidation');
    console.log('   - URL: https://www.techguru-it.asia/api/revalidate');
    console.log('   - HTTP Method: POST');
    console.log('   - Headers:');
    console.log('     x-revalidate-secret: ' + process.env.REVALIDATE_SECRET);
    console.log('   - Filter: _type in ["timelineEvent", "teamMember", "qualification"]');
    
    return null;
  }
}

// 运行脚本
setupWebhook();