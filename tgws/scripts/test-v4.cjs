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

  const input = page.locator('input[placeholder*="Search"]').first();

  // Test: LLM
  await input.fill('Large language model');
  // 等待搜索完成（Gemini API 需要 3-8 秒）
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'e2e/v4-llm.png' });
  console.log('Screenshot 1: LLM saved');

  // 输出摘要
  const text = await page.locator('.fixed.inset-0').first().innerText().catch(() => '');
  const summaryStart = text.indexOf('TECHGURU RESOURCES');
  const summaryEnd = text.indexOf('TechGuru (');
  if (summaryStart > 0) {
    console.log('\n=== AI Summary ===');
    console.log(text.substring(summaryStart, summaryEnd > summaryStart ? summaryEnd : summaryStart + 800));
  } else {
    console.log('\n=== Full modal ===');
    console.log(text.substring(0, 800));
  }

  await browser.close();
})();
