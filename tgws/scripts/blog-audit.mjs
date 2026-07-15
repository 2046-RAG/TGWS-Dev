import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'https://www.techguru-it.asia';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'audit-screenshots');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const issues = [];

function logIssue(severity, category, detail) {
  issues.push({ severity, category, detail });
  console.log(`[${severity}] ${category}: ${detail}`);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  // ========== 1. Blog List Page (EN) ==========
  console.log('\n=== Blog List EN ===');
  const page1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1.goto(`${BASE}/en/blog`, { waitUntil: 'networkidle', timeout: 30000 });
  await page1.waitForTimeout(2000);
  await page1.screenshot({ path: path.join(SCREENSHOT_DIR, 'blog-list-en.png'), fullPage: true });

  // Check accessibility: images without alt
  const imagesNoAlt = await page1.$$eval('img:not([alt])', imgs => imgs.length);
  if (imagesNoAlt > 0) logIssue('Critical', 'Accessibility', `Blog list: ${imagesNoAlt} images without alt text`);

  const imagesEmptyAlt = await page1.$$eval('img[alt=""]', imgs => imgs.length);
  if (imagesEmptyAlt > 0) logIssue('Warning', 'Accessibility', `Blog list: ${imagesEmptyAlt} images with empty alt`);

  // Check heading hierarchy
  const headings = await page1.$$eval('h1, h2, h3, h4, h5, h6', hs =>
    hs.map(h => ({ tag: h.tagName, text: h.textContent?.trim().substring(0, 60) }))
  );
  console.log('Headings:', JSON.stringify(headings, null, 2));
  const h1Count = headings.filter(h => h.tag === 'H1').length;
  if (h1Count === 0) logIssue('Critical', 'Accessibility', 'Blog list: No H1 heading found');
  if (h1Count > 1) logIssue('Warning', 'Accessibility', `Blog list: ${h1Count} H1 headings (should be 1)`);

  // Check links without accessible names
  const linksNoName = await page1.$$eval('a:not([aria-label]):not([title])', links =>
    links.filter(a => !a.textContent?.trim() && !a.querySelector('img[alt]')).length
  );
  if (linksNoName > 0) logIssue('Critical', 'Accessibility', `Blog list: ${linksNoName} links without accessible name`);

  // Check color contrast (basic check)
  const lowContrast = await page1.evaluate(() => {
    const elements = document.querySelectorAll('p, span, a, li');
    let issues = [];
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bg = style.backgroundColor;
      // Simple heuristic: if text is light gray on white
      if (color.includes('156, 163, 175') || color.includes('107, 114, 128')) {
        if (bg === 'rgba(0, 0, 0, 0)' || bg.includes('255, 255, 255')) {
          issues.push(el.tagName + ': ' + el.textContent?.substring(0, 40));
        }
      }
    });
    return issues.slice(0, 5);
  });
  if (lowContrast.length > 0) logIssue('Warning', 'Accessibility', `Blog list: Potential low contrast elements: ${lowContrast.join('; ')}`);

  // Check focus visible
  const focusStyles = await page1.evaluate(() => {
    const links = document.querySelectorAll('a');
    let noFocus = 0;
    links.forEach(a => {
      const style = window.getComputedStyle(a);
      if (!style.outlineStyle || style.outlineStyle === 'none') noFocus++;
    });
    return noFocus;
  });
  if (focusStyles > 5) logIssue('Warning', 'Accessibility', `Blog list: ${focusStyles} links may lack visible focus style`);

  // Check skip link
  const skipLink = await page1.$('a[href="#main"], a[href="#content"], .skip-link, [class*="skip"]');
  if (!skipLink) logIssue('Warning', 'Accessibility', 'Blog list: No skip navigation link found');

  // Check lang attribute
  const lang = await page1.$eval('html', el => el.getAttribute('lang'));
  console.log('HTML lang:', lang);

  // Check meta viewport
  const viewport = await page1.$eval('meta[name="viewport"]', el => el.getAttribute('content'));
  console.log('Viewport:', viewport);

  // Check blog cards count
  const cardCount = await page1.$$eval('[class*="card"], article', cards => cards.length);
  console.log('Blog cards/articles found:', cardCount);

  // Check load more / pagination
  const loadMore = await page1.$('button:has-text("Load More"), button:has-text("載入更多"), [class*="pagination"]');
  console.log('Load more/pagination:', loadMore ? 'Found' : 'Not found');

  await page1.close();

  // ========== 2. Blog Detail Page (EN) ==========
  console.log('\n=== Blog Detail EN ===');
  const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page2.goto(`${BASE}/en/blog/what-is-hci-beginners-guide`, { waitUntil: 'networkidle', timeout: 30000 });
  await page2.waitForTimeout(2000);
  await page2.screenshot({ path: path.join(SCREENSHOT_DIR, 'blog-detail-en.png'), fullPage: true });

  // Check article structure
  const articleStructure = await page2.evaluate(() => {
    const article = document.querySelector('article');
    if (!article) return { found: false };
    return {
      found: true,
      h1: article.querySelector('h1')?.textContent?.trim().substring(0, 60),
      h2Count: article.querySelectorAll('h2').length,
      h3Count: article.querySelectorAll('h3').length,
      paragraphCount: article.querySelectorAll('p').length,
      imgCount: article.querySelectorAll('img').length,
      imgsWithAlt: article.querySelectorAll('img[alt]').length,
      faqFound: article.textContent?.includes('FAQ') || article.textContent?.includes('Q:'),
      authorFound: article.textContent?.includes('TechGuru'),
    };
  });
  console.log('Article structure:', JSON.stringify(articleStructure, null, 2));

  if (!articleStructure.found) logIssue('Critical', 'Structure', 'Blog detail: No <article> element found');
  if (!articleStructure.h1) logIssue('Critical', 'Structure', 'Blog detail: No H1 in article');
  if (articleStructure.h2Count < 3) logIssue('Warning', 'Structure', `Blog detail: Only ${articleStructure.h2Count} H2 sections (expected 5+)`);
  if (articleStructure.paragraphCount < 10) logIssue('Warning', 'Structure', `Blog detail: Only ${articleStructure.paragraphCount} paragraphs (expected 20+)`);
  if (!articleStructure.faqFound) logIssue('Warning', 'Content', 'Blog detail: No FAQ section found');

  // Check content quality: language consistency
  const contentText = await page2.evaluate(() => {
    const article = document.querySelector('article');
    return article?.textContent || '';
  });
  const chineseChars = (contentText.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chineseChars > 5) logIssue('Critical', 'Content', `Blog detail (EN): ${chineseChars} Chinese characters found in English article`);

  // Check images in article
  const articleImages = await page2.$$eval('article img', imgs =>
    imgs.map(img => ({
      src: img.src?.substring(0, 80),
      alt: img.alt,
      width: img.naturalWidth,
      broken: img.naturalWidth === 0,
    }))
  );
  const brokenImages = articleImages.filter(img => img.broken);
  if (brokenImages.length > 0) logIssue('Critical', 'Content', `Blog detail: ${brokenImages.length} broken images: ${brokenImages.map(i => i.src).join(', ')}`);
  const noAltImages = articleImages.filter(img => !img.alt);
  if (noAltImages.length > 0) logIssue('Critical', 'Accessibility', `Blog detail: ${noAltImages.length} images without alt text`);

  // Check content spacing (the user's concern)
  const spacing = await page2.evaluate(() => {
    const article = document.querySelector('.article-content');
    if (!article) return null;
    const paragraphs = article.querySelectorAll('p');
    const firstP = paragraphs[0];
    const secondP = paragraphs[1];
    if (!firstP || !secondP) return null;
    const firstRect = firstP.getBoundingClientRect();
    const secondRect = secondP.getBoundingClientRect();
    return {
      paragraphGap: secondRect.top - firstRect.bottom,
      totalHeight: article.scrollHeight,
      viewportHeight: window.innerHeight,
    };
  });
  console.log('Spacing:', JSON.stringify(spacing));

  // Check JSON-LD
  const jsonLd = await page2.$$eval('script[type="application/ld+json"]', scripts =>
    scripts.map(s => {
      try { return JSON.parse(s.textContent); } catch { return null; }
    }).filter(Boolean)
  );
  console.log('JSON-LD schemas:', jsonLd.map(s => s['@type']).join(', '));
  if (jsonLd.length === 0) logIssue('Warning', 'SEO', 'Blog detail: No JSON-LD structured data found');

  // Check meta tags
  const meta = await page2.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
  }));
  console.log('Meta:', JSON.stringify(meta, null, 2));
  if (!meta.description) logIssue('Warning', 'SEO', 'Blog detail: No meta description');
  if (!meta.ogTitle) logIssue('Warning', 'SEO', 'Blog detail: No Open Graph title');
  if (!meta.ogImage) logIssue('Warning', 'SEO', 'Blog detail: No Open Graph image');

  // ========== 3. Blog Detail (ZH) ==========
  console.log('\n=== Blog Detail ZH ===');
  const page3 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page3.goto(`${BASE}/zh/blog/what-is-hci-beginners-guide`, { waitUntil: 'networkidle', timeout: 30000 });
  await page3.waitForTimeout(2000);
  await page3.screenshot({ path: path.join(SCREENSHOT_DIR, 'blog-detail-zh.png'), fullPage: true });

  const zhTitle = await page3.$eval('h1', el => el.textContent?.trim()).catch(() => 'N/A');
  console.log('ZH title:', zhTitle);
  const isZhTitle = /[\u4e00-\u9fff]/.test(zhTitle);
  if (!isZhTitle) logIssue('Critical', 'i18n', `Blog detail ZH: Title not in Chinese: "${zhTitle}"`);

  const zhContentText = await page3.evaluate(() => {
    const article = document.querySelector('article');
    return article?.textContent || '';
  });
  const enCharsInZh = (zhContentText.match(/[a-zA-Z]{10,}/g) || []).length;
  if (enCharsInZh > 10) logIssue('Warning', 'i18n', `Blog detail ZH: ${enCharsInZh} long English strings found (may need translation)`);

  await page3.close();

  // ========== 4. Mobile View ==========
  console.log('\n=== Mobile Blog List ===');
  const page4 = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page4.goto(`${BASE}/en/blog`, { waitUntil: 'networkidle', timeout: 30000 });
  await page4.waitForTimeout(2000);
  await page4.screenshot({ path: path.join(SCREENSHOT_DIR, 'blog-list-mobile.png'), fullPage: true });

  // Check touch targets
  const smallTargets = await page4.$$eval('a, button', els =>
    els.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width < 44 || rect.height < 44;
    }).length
  );
  if (smallTargets > 3) logIssue('Warning', 'Accessibility', `Mobile: ${smallTargets} touch targets smaller than 44px`);

  // Check horizontal overflow
  const hasOverflow = await page4.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth;
  });
  if (hasOverflow) logIssue('Critical', 'Responsive', 'Mobile: Horizontal overflow detected');

  await page4.close();
  await browser.close();

  // ========== Summary ==========
  console.log('\n\n========== AUDIT SUMMARY ==========');
  const critical = issues.filter(i => i.severity === 'Critical');
  const warnings = issues.filter(i => i.severity === 'Warning');
  console.log(`Critical: ${critical.length}`);
  console.log(`Warning: ${warnings.length}`);
  console.log('\nAll issues:');
  issues.forEach(i => console.log(`  [${i.severity}] ${i.category}: ${i.detail}`));

  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    summary: { critical: critical.length, warning: warnings.length, total: issues.length },
    issues,
    screenshots: fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png')),
  };
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'audit-report.json'), JSON.stringify(report, null, 2));
  console.log('\nReport saved to audit-screenshots/audit-report.json');
})();
