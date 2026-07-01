// @ts-check
const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'https://tgws.vercel.app';
const OUTPUT_DIR = path.join(__dirname, '..');

const pages = [
  { path: '/', name: '01-root' },
  { path: '/en', name: '02-locale' },
  { path: '/en/home', name: '03-home' },
  { path: '/en/blog', name: '04-blog' },
  { path: '/en/case-studies', name: '05-cases' },
  { path: '/en/products', name: '06-products' },
  { path: '/en/solutions', name: '07-solutions' },
  { path: '/en/contact', name: '08-contact' },
  { path: '/en/about', name: '09-about' },
  { path: '/en/support', name: '10-support' },
  { path: '/en/support/login', name: '11-login' },
  { path: '/en/support/register', name: '12-register' },
  { path: '/en/privacy', name: '13-privacy' },
  { path: '/en/terms', name: '14-terms' },
];

async function screenshotAll() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  for (const p of pages) {
    const url = `${BASE_URL}${p.path}`;
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response?.status() || 0;
      const screenshotPath = path.join(OUTPUT_DIR, `screenshot-${p.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`${status === 200 ? '✅' : '❌'} ${p.path} → ${status} → screenshot-${p.name}.png`);
    } catch (error) {
      console.log(`❌ ${p.path} → ERROR: ${error.message}`);
    }
  }
  
  await browser.close();
  console.log('\n截图完成！');
}

screenshotAll().catch(console.error);