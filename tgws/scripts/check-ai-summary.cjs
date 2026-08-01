const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto('https://www.techguru-it.asia', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);

  // 打开搜索
  await page.locator('button[title="Search"]').first().click();
  await page.waitForTimeout(2000);

  // 输入 HCI 并按 Enter 搜索
  const input = page.locator('input[placeholder*="Search"]').first();
  await input.fill('HCI');
  await input.press('Enter');
  await page.waitForTimeout(8000);

  // 截图
  await page.screenshot({ path: 'e2e/ai-summary-hci.png' });
  console.log('Screenshot saved to e2e/ai-summary-hci.png');

  // 获取摘要文本
  const modalText = await page.locator('.fixed.inset-0').first().innerText().catch(() => 'NOT_FOUND');
  console.log('\n=== Full modal text (first 1200 chars) ===');
  console.log(modalText.substring(0, 1200));

  await browser.close();
})();
