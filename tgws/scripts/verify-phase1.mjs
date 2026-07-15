import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('dark-mode-verify', { recursive: true });

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

console.log('=== Phase 1 验证 ===\n');

// 1. 验证sitemap动态blog slug
console.log('1. 检查sitemap动态blog slug...');
await page.goto('https://www.techguru-it.asia/sitemap.xml', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const sitemapContent = await page.content();
const blogUrls = sitemapContent.match(/\/blog\/[a-z0-9-]+/g) || [];
console.log(`   找到 ${blogUrls.length} 个blog URL`);
if (blogUrls.length > 0) {
  console.log(`   示例: ${blogUrls[0]}`);
}
await page.screenshot({ path: 'dark-mode-verify/verify-01-sitemap.png', fullPage: false });

// 2. 验证Blog Article JSON-LD
console.log('\n2. 检查Blog Article JSON-LD...');
await page.goto('https://www.techguru-it.asia/en/blog', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const blogLinks = await page.locator('a[href*="/en/blog/"]').all();
if (blogLinks.length > 0) {
  const firstBlogUrl = await blogLinks[0].getAttribute('href');
  console.log(`   访问第一篇博客: ${firstBlogUrl}`);
  await page.goto(`https://www.techguru-it.asia${firstBlogUrl}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const jsonLd = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    return Array.from(scripts).map(s => JSON.parse(s.textContent));
  });
  console.log(`   找到 ${jsonLd.length} 个JSON-LD块`);
  const articleJsonLd = jsonLd.find(j => j['@type'] === 'Article');
  if (articleJsonLd) {
    console.log(`   ✅ Article JSON-LD存在`);
    console.log(`   标题: ${articleJsonLd.headline}`);
    console.log(`   作者: ${articleJsonLd.author?.name}`);
  } else {
    console.log(`   ❌ Article JSON-LD不存在`);
  }
  await page.screenshot({ path: 'dark-mode-verify/verify-02-blog-jsonld.png', fullPage: false });
}

// 3. 验证注册流程
console.log('\n3. 检查注册流程...');
await page.goto('https://www.techguru-it.asia/en/support/register', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/verify-03-register.png', fullPage: false });
console.log(`   注册页面加载成功`);

// 4. 验证Dark Mode
console.log('\n4. 检查Dark Mode...');
await page.addInitScript(() => {
  localStorage.setItem('theme', 'dark');
});
await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const htmlClass = await page.evaluate(() => document.documentElement.className);
const bgColor = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
console.log(`   HTML class: ${htmlClass}`);
console.log(`   Body背景: ${bgColor}`);
await page.screenshot({ path: 'dark-mode-verify/verify-04-darkmode.png', fullPage: false });

// 5. 验证Toggle简化（2态）
console.log('\n5. 检查Toggle简化...');
await page.evaluate(() => localStorage.removeItem('theme'));
await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const toggleLabel = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label*="mode"]');
  return btn ? btn.getAttribute('aria-label') : 'not found';
});
console.log(`   Toggle标签: ${toggleLabel}`);
const hasA = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label*="mode"]');
  return btn ? btn.textContent.includes('A') : false;
});
console.log(`   包含"A"字母: ${hasA ? '是 ❌' : '否 ✅'}`);

await browser.close();
console.log('\n=== 验证完成 ===');
