import { chromium } from 'playwright';

// ═══════════════════════════════════════════════
// Best Practice页面截图工具
// ═══════════════════════════════════════════════

const URL = 'https://www.techguru-it.asia/en/case-studies';

console.log('=== Best Practice Page Screenshot ===\n');
console.log(`URL: ${URL}\n`);

const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

const page = await context.newPage();

try {
  console.log('Loading page...');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 截图1: 完整页面顶部
  console.log('Capturing: page top...');
  await page.screenshot({ path: 'best-practice-top.png', fullPage: false });

  // 截图2: 页面中部（向下滚动500px）
  console.log('Capturing: page middle...');
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'best-practice-middle.png', fullPage: false });

  // 截图3: 页面底部（向下滚动1500px）
  console.log('Capturing: page bottom...');
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'best-practice-bottom.png', fullPage: false });

  // 截图4: 完整页面截图
  console.log('Capturing: full page...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'best-practice-full.png', fullPage: true });

  // 获取页面内容分析
  console.log('\nAnalyzing page content...');

  const pageInfo = await page.evaluate(() => {
    const title = document.querySelector('h1')?.textContent?.trim() || 'No h1';
    const cards = document.querySelectorAll('[class*="card"], [class*="Card"], article, [role="article"]');
    const links = document.querySelectorAll('a[href*="case-studies/"]');
    const images = document.querySelectorAll('img');
    const errors = [];

    // 检查常见问题
    if (cards.length === 0) errors.push('No case study cards found');
    if (links.length === 0) errors.push('No case study links found');

    // 检查图片
    const brokenImages = [];
    images.forEach(img => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        brokenImages.push(img.src || img.alt || 'unknown');
      }
    });

    // 检查空白内容
    const emptyElements = [];
    document.querySelectorAll('h1, h2, h3, p').forEach(el => {
      if (!el.textContent?.trim()) {
        emptyElements.push({ tag: el.tagName, class: el.className });
      }
    });

    return {
      title,
      cardsCount: cards.length,
      linksCount: links.length,
      imagesCount: images.length,
      brokenImages,
      emptyElements,
      errors,
      bodyText: document.body.textContent?.substring(0, 500),
    };
  });

  console.log('\n=== Page Analysis ===');
  console.log(`Title: ${pageInfo.title}`);
  console.log(`Cards: ${pageInfo.cardsCount}`);
  console.log(`Links: ${pageInfo.linksCount}`);
  console.log(`Images: ${pageInfo.imagesCount}`);

  if (pageInfo.brokenImages.length > 0) {
    console.log(`\n❌ Broken Images (${pageInfo.brokenImages.length}):`);
    pageInfo.brokenImages.forEach(src => console.log(`  - ${src}`));
  }

  if (pageInfo.emptyElements.length > 0) {
    console.log(`\n❌ Empty Elements (${pageInfo.emptyElements.length}):`);
    pageInfo.emptyElements.forEach(el => console.log(`  - ${el.tag}.${el.class}`));
  }

  if (pageInfo.errors.length > 0) {
    console.log(`\n❌ Errors:`);
    pageInfo.errors.forEach(err => console.log(`  - ${err}`));
  }

  console.log(`\nBody Preview: ${pageInfo.bodyText}`);

} catch (error) {
  console.error('Error:', error.message);
} finally {
  await browser.close();
  console.log('\n✅ Screenshots saved!');
}
