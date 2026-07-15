import { chromium } from '@playwright/test';

const url = 'https://www.techguru-it.asia/en';
const screenshotPath = 'audit-homepage.png';

async function takeScreenshot() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle' });
  // Wait a bit for animations
  await page.waitForTimeout(2000);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  await browser.close();
  console.log(`Screenshot saved to ${screenshotPath}`);
}

takeScreenshot().catch(console.error);