import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'https://www.techguru-it.asia';
const DIR = join(__dirname, '..', 'audit-screenshots', 'v2');
import fs from 'fs';
fs.mkdirSync(DIR, { recursive: true });

const pages = [
  { name: 'hero', url: '/en' },
  { name: 'products', url: '/en/products' },
  { name: 'solutions', url: '/en/solutions' },
  { name: 'blog', url: '/en/blog' },
  { name: 'support', url: '/en/support/login' },
  { name: 'dark-hero', url: '/en', theme: 'dark' },
  { name: 'dark-products', url: '/en/products', theme: 'dark' },
];

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });

  for (const pg of pages) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    if (pg.theme === 'dark') {
      await page.goto(`${BASE}${pg.url}`);
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });
      await page.reload({ waitUntil: 'networkidle' });
    } else {
      await page.goto(`${BASE}${pg.url}`, { waitUntil: 'networkidle' });
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(DIR, `${pg.name}.png`), fullPage: true });
    console.log(`✅ ${pg.name}.png`);
    await ctx.close();
  }

  // Check dark mode CSS
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle' });

  const darkModeIssues = await page.evaluate(() => {
    const html = document.documentElement;
    html.classList.add('dark');

    const issues = [];
    // Check text colors
    const textElements = document.querySelectorAll('h1, h2, h3, p, span, a');
    textElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      if (color.includes('24, 24, 27') || color.includes('23, 23, 23')) {
        // Dark text on dark background
        issues.push(`Dark text on dark bg: ${el.tagName} "${el.textContent?.substring(0, 30)}" color: ${color}`);
      }
    });

    // Check background colors
    const bgElements = document.querySelectorAll('section, div, main');
    bgElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.backgroundColor === 'rgb(255, 255, 255)') {
        issues.push(`White bg on dark mode: ${el.tagName}.${el.className?.substring(0, 30)}`);
      }
    });

    return issues.slice(0, 20);
  });

  console.log('\n=== Dark Mode Issues ===');
  darkModeIssues.forEach(i => console.log(`  ⚠️ ${i}`));

  // Check partner logos
  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const logoIssues = await page.evaluate(() => {
    const logos = document.querySelectorAll('img[alt*="logo"], img[src*="logo"], [class*="partner"] img, [class*="logo"] img');
    return {
      count: logos.length,
      issues: Array.from(logos).slice(0, 10).map(img => ({
        src: img.src?.substring(0, 60),
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })),
    };
  });

  console.log(`\n=== Partner Logos: ${logoIssues.count} found ===`);

  // Check registration
  await page.goto(`${BASE}/en/support/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const regForm = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const buttons = document.querySelectorAll('button');
    return {
      inputs: Array.from(inputs).map(i => ({ type: i.type, name: i.name, placeholder: i.placeholder })),
      buttons: Array.from(buttons).map(b => b.textContent?.trim()),
      formAction: document.querySelector('form')?.action,
    };
  });
  console.log('\n=== Registration Form ===');
  console.log('Inputs:', JSON.stringify(regForm.inputs));
  console.log('Buttons:', regForm.buttons);

  await browser.close();
  console.log('\nScreenshots saved to audit-screenshots/v2/');
})();
