import { test, expect } from '@playwright/test';

test('CORS修复后推荐内容验证', async ({ browser }) => {
  const page = await browser.newPage();
  
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('CORS')) {
      errors.push(msg.text().substring(0, 100));
    }
  });

  await page.goto('https://www.techguru-it.asia', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  await page.locator('button[title="Search"]').first().click();
  await page.waitForTimeout(4000);

  // 截图
  await page.screenshot({ path: 'e2e/suggestions-after-cors.png' });

  // 获取推荐区文本
  const modalText = await page.locator('.fixed.inset-0').first().innerText().catch(() => '');

  console.log('\n=== 推荐内容 ===');
  console.log(modalText.substring(0, 600));
  console.log('\n=== CORS 错误数: ' + errors.length + ' ===');

  await page.close();
});
