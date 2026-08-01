// Re-probe global search with longer waits + capture result heading text
import { chromium } from '@playwright/test';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:3000';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: EDGE });
  // ---- homepage images ----
  const p = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await p.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(4000);
  const imgs = await p.evaluate(() => Array.from(document.images).map(i => ({ src: i.currentSrc || i.src, complete: i.complete, nw: i.naturalWidth })));
  const broken = imgs.filter(i => !i.complete || i.nw === 0);
  const byPrefix = {};
  for (const b of broken) { try { const u = new URL(b.src); const k = u.pathname; byPrefix[k] = (byPrefix[k]||0)+1; } catch {} }
  console.log('IMG_TOTAL', imgs.length, 'IMG_BROKEN', broken.length);
  console.log('IMG_BROKEN_PATHS', JSON.stringify(byPrefix, null, 1));
  console.log('IMG_SAMPLE_BROKEN', JSON.stringify(broken.slice(0,5).map(b=>b.src)));
  console.log('IMG_SAMPLE_OK', JSON.stringify(imgs.filter(i=>i.nw>0).slice(0,3).map(i=>i.src)));
  await p.close();

  // ---- search ----
  const s = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await s.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await s.waitForTimeout(800);
  await s.locator('button[title="Search"]').click();
  await s.waitForTimeout(700);
  const input = s.locator('input[type=text]').first();
  await input.fill('cybersecurity');
  // wait for either results heading or "No results"
  try {
    await s.waitForSelector('text=results', { timeout: 15000 });
  } catch {}
  await s.waitForTimeout(1000);
  const bodyText = (await s.content()).replace(/\s+/g,' ');
  const internal = /TechGuru \((\d+) results\)/.exec(bodyText);
  const web = /From the Web \((\d+) results\)/.exec(bodyText);
  const degrade = bodyText.includes('AI-enhanced web search is currently unavailable');
  const ai = /AI Summary/i.test(bodyText);
  const noResults = bodyText.includes('No results found');
  console.log('SEARCH_internal', internal ? internal[0] : 'none');
  console.log('SEARCH_web', web ? web[0] : 'none');
  console.log('SEARCH_degradeIndicator', degrade);
  console.log('SEARCH_aiSummaryPresent', ai);
  console.log('SEARCH_noResults', noResults);
  await s.close();
  await browser.close();
})();