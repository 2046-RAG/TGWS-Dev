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

  // Test 1: HCI 搜索（自动触发）
  const input = page.locator('input[placeholder*="Search"]').first();
  await input.fill('HCI');
  await page.waitForTimeout(5000); // debounce 500ms + API 等待
  await page.screenshot({ path: 'e2e/v2-hci.png' });
  console.log('Screenshot 1: HCI saved');

  // Test 2: 清空并搜索 RPA（测试缺口检测）
  await input.fill('');
  await page.waitForTimeout(1000);
  await input.fill('RPA');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'e2e/v2-rpa.png' });
  console.log('Screenshot 2: RPA saved');

  // 输出 HCI 搜索结果
  const text1 = await page.locator('.fixed.inset-0').first().innerText().catch(() => '');
  console.log('\n=== HCI Summary ===');
  console.log(text1.substring(text1.indexOf('TechGuru Resources'), text1.indexOf('TechGuru (') > 0 ? text1.indexOf('TechGuru (') : text1.indexOf('TechGuru Resources') + 500));

  // 输出 RPA 搜索结果（检查缺口检测）
  const text2 = await page.locator('.fixed.inset-0').first().innerText().catch(() => '');
  console.log('\n=== RPA Results ===');
  console.log(text2.substring(0, 800));

  await browser.close();
})();
