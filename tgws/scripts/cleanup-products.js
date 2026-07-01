const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'REPLACED_SANITY_TOKEN',
  useCdn: false
});

// v3方案确定的产品列表（18个）
const V3_PRODUCTS = {
  build: [
    'ai-generated-content-aigc',
    'ai-assisted-coding',
    'ai-agent-development',
    'enterprise-legacy-system-ai-augmentation'
  ],
  run: [
    'server-virtualization-platform',
    'hyper-converged-infrastructure',
    'cloud-migration',
    'cloud-repatriation',
    'enterprise-storage-solutions',
    'managed-hosting-services',
    'business-continuity-disaster-recovery'
  ],
  protect: [
    'next-gen-firewall-ips',
    'web-application-firewall',
    'endpoint-detection-response',
    'network-detection-response',
    'cloud-security',
    'sd-wan-load-balancing',
    'managed-detection-response',
    'incident-response'
  ]
};

const ALL_V3_SLUGS = [
  ...V3_PRODUCTS.build,
  ...V3_PRODUCTS.run,
  ...V3_PRODUCTS.protect
];

async function cleanupProducts() {
  console.log('=== 清理Sanity产品（按v3方案）===\n');
  
  try {
    // 获取所有现有产品
    const existingProducts = await client.fetch('*[_type == "product"] {_id, title, slug, category}');
    console.log(`现有产品数量: ${existingProducts.length}`);
    
    // 找出需要删除的产品（不在v3列表中的）
    const toDelete = existingProducts.filter(p => {
      const slug = p.slug?.current;
      return !ALL_V3_SLUGS.includes(slug);
    });
    
    console.log(`需要删除的产品: ${toDelete.length}`);
    
    if (toDelete.length > 0) {
      console.log('\n删除以下产品:');
      for (const product of toDelete) {
        console.log(`  - ${product.title} (${product.slug?.current || 'no-slug'}) [${product.category}]`);
        await client.delete(product._id);
      }
    }
    
    // 验证结果
    const remainingProducts = await client.fetch('*[_type == "product"] {_id, title, slug, category}');
    console.log(`\n清理后产品数量: ${remainingProducts.length}`);
    
    // 按分类统计
    const byCategory = {
      build: remainingProducts.filter(p => p.category === 'build').length,
      run: remainingProducts.filter(p => p.category === 'run').length,
      protect: remainingProducts.filter(p => p.category === 'protect').length
    };
    
    console.log(`  Build: ${byCategory.build}`);
    console.log(`  Run: ${byCategory.run}`);
    console.log(`  Protect: ${byCategory.protect}`);
    
    // 检查是否有缺失的产品
    console.log('\n检查v3方案完整性:');
    for (const [category, slugs] of Object.entries(V3_PRODUCTS)) {
      for (const slug of slugs) {
        const exists = remainingProducts.some(p => p.slug?.current === slug);
        if (!exists) {
          console.log(`  ⚠️ 缺失: ${category}/${slug}`);
        }
      }
    }
    
    console.log('\n✅ 产品清理完成！');
    
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
  }
}

cleanupProducts();