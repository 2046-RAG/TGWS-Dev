const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto('https://www.techguru-it.asia', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);

  await page.locator('button[title="Search"]').first().click();
  await page.waitForTimeout(1000);

  // Test 1: LLM 搜索
  const input = page.locator('input[placeholder*="Search"]').first();
  await input.fill('Large language model');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'e2e/v3-llm.png' });
  console.log('Screenshot 1: LLM saved');

  // Test 2: HCI
  await input.fill('');
  await page.waitForTimeout(500);
  await input.fill('HCI');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'e2e/v3-hci.png' });
  console.log('Screenshot 2: HCI saved');

  // Test 3: RPA
  await input.fill('');
  await page.waitForTimeout(500);
  await input.fill('RPA');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'e2e/v3-rpa.png' });
  console.log('Screenshot 3: RPA saved');

  // 输出 LLM 摘要
  const text = await page.locator('.fixed.inset-0').first().innerText().catch(() => '');
  console.log('\n=== LLM Summary ===');
  console.log(text.substring(0, 1000));

  await browser.close();
})();
