import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Capture AI category
console.log('Capturing AI videos...');
await page.goto('https://mixkit.co/free-stock-video/artificial-intelligence/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(4000);
// Try to close popup
try { await page.click('text=Maybe later', { timeout: 2000 }); } catch {}
try { await page.click('[class*="close"]', { timeout: 2000 }); } catch {}
await page.waitForTimeout(1000);
await page.evaluate(() => window.scrollBy(0, 500));
await page.waitForTimeout(2000);
await page.screenshot({ path: 'mixkit-ai.png' });
console.log('OK: ai');

// Capture data category
console.log('Capturing data videos...');
await page.goto('https://mixkit.co/free-stock-video/data/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(4000);
try { await page.click('text=Maybe later', { timeout: 2000 }); } catch {}
await page.waitForTimeout(1000);
await page.evaluate(() => window.scrollBy(0, 500));
await page.waitForTimeout(2000);
await page.screenshot({ path: 'mixkit-data.png' });
console.log('OK: data');

// Capture futuristic category
console.log('Capturing futuristic videos...');
await page.goto('https://mixkit.co/free-stock-video/futuristic/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(4000);
try { await page.click('text=Maybe later', { timeout: 2000 }); } catch {}
await page.waitForTimeout(1000);
await page.evaluate(() => window.scrollBy(0, 500));
await page.waitForTimeout(2000);
await page.screenshot({ path: 'mixkit-futuristic.png' });
console.log('OK: futuristic');

await browser.close();
console.log('Done!');
