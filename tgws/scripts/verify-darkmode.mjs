/**
 * Playwright截图验证暗色模式3态切换
 * 浏览器: Microsoft Edge (系统内置)
 * 模式: auto / light / dark
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'https://www.techguru-it.asia/en';
const OUTPUT_DIR = join(import.meta.dirname, '..', 'test-results', 'darkmode');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

async function run() {
  console.log('=== 暗色模式3态截图验证 ===\n');

  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  // --- Test 1: Auto mode (system preference = light) ---
  console.log('[1] Auto模式 (系统偏好=浅色)');
  const ctx1 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
  });
  const page1 = await ctx1.newPage();
  await page1.goto(URL, { waitUntil: 'networkidle' });
  // Clear stored theme to ensure auto mode
  await page1.evaluate(() => localStorage.removeItem('theme'));
  await page1.reload({ waitUntil: 'networkidle' });
  await page1.waitForTimeout(500);
  const isDark1 = await page1.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log(`  dark class: ${isDark1} (expected: false)`);
  await page1.screenshot({ path: join(OUTPUT_DIR, '01-auto-light.png'), fullPage: false });
  console.log(`  截图: 01-auto-light.png`);
  await ctx1.close();

  // --- Test 2: Auto mode (system preference = dark) ---
  console.log('\n[2] Auto模式 (系统偏好=深色)');
  const ctx2 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const page2 = await ctx2.newPage();
  await page2.goto(URL, { waitUntil: 'networkidle' });
  await page2.evaluate(() => localStorage.removeItem('theme'));
  await page2.reload({ waitUntil: 'networkidle' });
  await page2.waitForTimeout(500);
  const isDark2 = await page2.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log(`  dark class: ${isDark2} (expected: true)`);
  await page2.screenshot({ path: join(OUTPUT_DIR, '02-auto-dark.png'), fullPage: false });
  console.log(`  截图: 02-auto-dark.png`);
  await ctx2.close();

  // --- Test 3: Force light mode ---
  console.log('\n[3] 强制浅色模式');
  const ctx3 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark', // system is dark, but we force light
  });
  const page3 = await ctx3.newPage();
  await page3.goto(URL, { waitUntil: 'networkidle' });
  await page3.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page3.reload({ waitUntil: 'networkidle' });
  await page3.waitForTimeout(500);
  const isDark3 = await page3.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log(`  dark class: ${isDark3} (expected: false, even though system=dark)`);
  await page3.screenshot({ path: join(OUTPUT_DIR, '03-force-light.png'), fullPage: false });
  console.log(`  截图: 03-force-light.png`);
  await ctx3.close();

  // --- Test 4: Force dark mode ---
  console.log('\n[4] 强制深色模式');
  const ctx4 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light', // system is light, but we force dark
  });
  const page4 = await ctx4.newPage();
  await page4.goto(URL, { waitUntil: 'networkidle' });
  await page4.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await page4.reload({ waitUntil: 'networkidle' });
  await page4.waitForTimeout(500);
  const isDark4 = await page4.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log(`  dark class: ${isDark4} (expected: true, even though system=light)`);
  await page4.screenshot({ path: join(OUTPUT_DIR, '04-force-dark.png'), fullPage: false });
  console.log(`  截图: 04-force-dark.png`);
  await ctx4.close();

  // --- Test 5: Toggle click cycle ---
  console.log('\n[5] 按钮点击循环测试');
  const ctx5 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
  });
  const page5 = await ctx5.newPage();
  await page5.goto(URL, { waitUntil: 'networkidle' });
  await page5.evaluate(() => localStorage.removeItem('theme'));
  await page5.reload({ waitUntil: 'networkidle' });
  await page5.waitForTimeout(500);

  // Find and click the dark mode toggle
  const toggleBtn = page5.locator('button[aria-label*="Theme:"]');
  const toggleCount = await toggleBtn.count();
  console.log(`  找到Toggle按钮: ${toggleCount > 0 ? 'YES' : 'NO'}`);

  if (toggleCount > 0) {
    const label1 = await toggleBtn.getAttribute('aria-label');
    console.log(`  初始状态: ${label1}`);

    // Click once -> should cycle to light
    await toggleBtn.click();
    await page5.waitForTimeout(300);
    const label2 = await toggleBtn.getAttribute('aria-label');
    const isDark5a = await page5.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`  点击1次: ${label2}, dark=${isDark5a}`);

    // Click again -> should cycle to dark
    await toggleBtn.click();
    await page5.waitForTimeout(300);
    const label3 = await toggleBtn.getAttribute('aria-label');
    const isDark5b = await page5.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`  点击2次: ${label3}, dark=${isDark5b}`);
    await page5.screenshot({ path: join(OUTPUT_DIR, '05-after-toggle-dark.png'), fullPage: false });
    console.log(`  截图: 05-after-toggle-dark.png`);

    // Click again -> should cycle back to auto
    await toggleBtn.click();
    await page5.waitForTimeout(300);
    const label4 = await toggleBtn.getAttribute('aria-label');
    const isDark5c = await page5.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`  点击3次: ${label4}, dark=${isDark5c}`);
  }
  await ctx5.close();

  await browser.close();

  // --- Summary ---
  console.log('\n=== 验证结果 ===');
  const results = [
    { test: 'Auto + 系统浅色', expected: false, actual: isDark1 },
    { test: 'Auto + 系统深色', expected: true, actual: isDark2 },
    { test: '强制浅色 (系统深色)', expected: false, actual: isDark3 },
    { test: '强制深色 (系统浅色)', expected: true, actual: isDark4 },
  ];
  let passed = 0;
  for (const r of results) {
    const ok = r.expected === r.actual;
    if (ok) passed++;
    console.log(`  ${ok ? '✅' : '❌'} ${r.test}: dark=${r.actual} (expected=${r.expected})`);
  }
  console.log(`\n总计: ${passed}/${results.length} 通过`);
  console.log(`截图目录: ${OUTPUT_DIR}`);
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
