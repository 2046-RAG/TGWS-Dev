const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('CORS')) {
      errors.push('CORS_BLOCKED');
    }
  });

  await page.goto('https://www.techguru-it.asia', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);

  await page.locator('button[title="Search"]').first().click();
  await page.waitForTimeout(5000);

  const modalText = await page.locator('.fixed.inset-0').first().innerText().catch(() => 'NOT_FOUND');

  console.log('\n=== 推荐内容 ===');
  console.log(modalText.substring(0, 1000));
  console.log('\n=== CORS 错误数: ' + errors.length + ' ===');
  console.log('VMware Alternatives: ' + modalText.includes('VMware'));
  console.log('Trending: ' + modalText.includes('Trending'));

  // 统计推荐区有多少项
  const buttons = await page.locator('.space-y-2 button').count().catch(() => 0);
  console.log('推荐项按钮数: ' + buttons);

  await browser.close();
})();
