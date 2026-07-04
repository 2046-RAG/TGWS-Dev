const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const pages = [
  { url: '/en/home', name: '01-home-en' },
  { url: '/zh/home', name: '02-home-zh' },
  { url: '/en/products', name: '03-products' },
  { url: '/en/vmware-alternative', name: '04-vmware' },
  { url: '/en/solutions', name: '05-solutions' },
  { url: '/en/about', name: '06-about' },
  { url: '/en/contact', name: '07-contact' },
  { url: '/en/support/login', name: '08-login' },
];

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });

  const outDir = path.join(__dirname, '..', 'e2e', 'design-audit');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const p of pages) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await page.goto(`https://www.techguru-it.asia${p.url}`, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(2000);

      // Scroll through to trigger animations
      const height = await page.evaluate(() => document.body.scrollHeight);
      for (let i = 0; i < height; i += 400) {
        await page.evaluate((y) => window.scrollTo(0, y), i);
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      await page.screenshot({ path: path.join(outDir, `${p.name}.png`), fullPage: true });

      // Collect design metrics
      const metrics = await page.evaluate(() => {
        const styles = getComputedStyle(document.body);
        const fonts = new Set();
        document.querySelectorAll('*').forEach(el => {
          const f = getComputedStyle(el).fontFamily;
          if (f) fonts.add(f.split(',')[0].trim().replace(/"/g, ''));
        });

        const colors = new Set();
        document.querySelectorAll('*').forEach(el => {
          const c = getComputedStyle(el).color;
          if (c && c !== 'rgb(0, 0, 0)') colors.add(c);
        });

        return {
          bodyBg: styles.backgroundColor,
          bodyColor: styles.color,
          fonts: [...fonts].slice(0, 5),
          uniqueColors: colors.size,
          totalElements: document.querySelectorAll('*').length,
          images: document.querySelectorAll('img').length,
          brokenImages: Array.from(document.querySelectorAll('img')).filter(i => !i.complete || i.naturalWidth === 0).length,
        };
      });

      console.log(`${p.name}: fonts=${metrics.fonts.join(', ')} | colors=${metrics.uniqueColors} | imgs=${metrics.images} broken=${metrics.brokenImages}`);
    } catch (e) {
      console.log(`${p.name}: ERROR - ${e.message.substring(0, 60)}`);
    }
    await page.close();
  }

  await browser.close();
  console.log(`\nScreenshots: ${outDir}`);
})();
