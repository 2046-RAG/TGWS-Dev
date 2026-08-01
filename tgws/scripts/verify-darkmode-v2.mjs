import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'https://www.techguru-it.asia/en';
const DIR = join(import.meta.dirname, '..', 'test-results', 'darkmode-v2');
if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });

const b = await chromium.launch({ executablePath: EDGE, headless: true });

// Test 1: 3 separate buttons exist
console.log('[1] 3个独立按钮存在性');
const ctx1 = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
const p1 = await ctx1.newPage();
await p1.goto(URL, { waitUntil: 'networkidle' });
await p1.evaluate(() => localStorage.removeItem('theme'));
await p1.reload({ waitUntil: 'networkidle' });
await p1.waitForTimeout(500);
const radios = p1.locator('button[role="radio"]');
const count = await radios.count();
console.log(`  Radio buttons: ${count} (expected: 3)`);
for (let i = 0; i < count; i++) {
  const label = await radios.nth(i).getAttribute('aria-label');
  const checked = await radios.nth(i).getAttribute('aria-checked');
  console.log(`  [${i}] ${label} checked=${checked}`);
}
await p1.screenshot({ path: join(DIR, '01-three-buttons.png') });
await ctx1.close();

// Test 2: LanguageSwitcher visible in dark mode
console.log('\n[2] 暗色模式LanguageSwitcher可见性');
const ctx2 = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
const p2 = await ctx2.newPage();
await p2.goto(URL, { waitUntil: 'networkidle' });
await p2.evaluate(() => { localStorage.setItem('theme', 'dark'); });
await p2.reload({ waitUntil: 'networkidle' });
await p2.waitForTimeout(500);
const langBtn = p2.locator('button[aria-label="Language selector"]').first();
const langVisible = await langBtn.isVisible();
console.log(`  LanguageSwitcher visible: ${langVisible} (expected: true)`);
const langColor = await langBtn.evaluate(el => getComputedStyle(el).color);
console.log(`  LanguageSwitcher text color: ${langColor}`);
await p2.screenshot({ path: join(DIR, '02-dark-mode-lang.png') });
await ctx2.close();

// Test 3: Click each button and verify
console.log('\n[3] 点击每个按钮验证');
const ctx3 = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
const p3 = await ctx3.newPage();
await p3.goto(URL, { waitUntil: 'networkidle' });
await p3.evaluate(() => localStorage.removeItem('theme'));
await p3.reload({ waitUntil: 'networkidle' });
await p3.waitForTimeout(500);

// Click Light
await p3.locator('button[aria-label="Theme: light"]').click();
await p3.waitForTimeout(300);
const d1 = await p3.evaluate(() => document.documentElement.classList.contains('dark'));
console.log(`  Click Light: dark=${d1} (expected: false)`);
await p3.screenshot({ path: join(DIR, '03-light-active.png') });

// Click Dark
await p3.locator('button[aria-label="Theme: dark"]').click();
await p3.waitForTimeout(300);
const d2 = await p3.evaluate(() => document.documentElement.classList.contains('dark'));
console.log(`  Click Dark: dark=${d2} (expected: true)`);
await p3.screenshot({ path: join(DIR, '04-dark-active.png') });

// Click Auto
await p3.locator('button[aria-label="Theme: auto"]').click();
await p3.waitForTimeout(300);
const d3 = await p3.evaluate(() => document.documentElement.classList.contains('dark'));
console.log(`  Click Auto: dark=${d3} (expected: false, system=light)`);
await ctx3.close();

await b.close();

console.log('\n=== 结果 ===');
const ok = count === 3 && langVisible && !d1 && d2 && !d3;
console.log(ok ? '✅ 全部通过' : '❌ 有失败项');
