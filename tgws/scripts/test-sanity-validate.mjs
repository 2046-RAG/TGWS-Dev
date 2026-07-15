// 测试Sanity验证逻辑

function validate(doc, schema) {
  const errors = [];
  const warnings = [];

  if (!doc._type) errors.push('缺少 _type 字段');

  const s = schema || doc._type || 'unknown';

  if (s === 'post') {
    if (doc.title && typeof doc.title === 'object') {
      errors.push('title 是对象格式 {en, zh}，但schema定义为 string');
    }
    if (doc.excerpt && typeof doc.excerpt === 'object') {
      errors.push('excerpt 是对象格式，但schema定义为 text');
    }
    if (doc.content && !Array.isArray(doc.content)) {
      errors.push('content 必须是数组格式');
    }
    if (!doc.slug?.current) errors.push('缺少 slug.current');
    if (!doc.category) warnings.push('缺少 category');
  }

  return { errors, warnings };
}

// 测试1: 正确格式
const correct = { _type: 'post', title: 'Test Post', slug: { current: 'test' }, category: 'technical', content: [] };
const r1 = validate(correct, 'post');
console.log('测试1 (正确格式):', r1.errors.length === 0 ? '✅ PASS' : '❌ FAIL');

// 测试2: 错误格式 - title是对象
const wrongTitle = { _type: 'post', title: { en: 'Test', zh: '测试' }, slug: { current: 'test' }, content: [] };
const r2 = validate(wrongTitle, 'post');
console.log('测试2 (title对象):', r2.errors.length > 0 ? '✅ PASS - 检测到错误' : '❌ FAIL - 未检测到');
console.log('  错误:', r2.errors);

// 测试3: 错误格式 - excerpt是对象
const wrongExcerpt = { _type: 'post', title: 'Test', slug: { current: 'test' }, excerpt: { en: 'Excerpt', zh: '摘要' }, content: [] };
const r3 = validate(wrongExcerpt, 'post');
console.log('测试3 (excerpt对象):', r3.errors.length > 0 ? '✅ PASS - 检测到错误' : '❌ FAIL - 未检测到');
console.log('  错误:', r3.errors);

// 测试4: 缺少slug
const noSlug = { _type: 'post', title: 'Test', content: [] };
const r4 = validate(noSlug, 'post');
console.log('测试4 (缺少slug):', r4.errors.length > 0 ? '✅ PASS - 检测到错误' : '❌ FAIL - 未检测到');

// 测试5: 正确Product格式
const correctProduct = { _type: 'product', name: 'Test Product', category: 'build' };
const r5 = validate(correctProduct, 'product');
console.log('测试5 (Product正确):', r5.errors.length === 0 ? '✅ PASS' : '❌ FAIL');

// 测试6: Product缺少category
const noCat = { _type: 'product', name: 'Test' };
const r6 = validate(noCat, 'product');
console.log('测试6 (Product无category):', r6.errors.length > 0 ? '✅ PASS' : '❌ FAIL');

console.log('\n=== 全部测试完成 ===');
