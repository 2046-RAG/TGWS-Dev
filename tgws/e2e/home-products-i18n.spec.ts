import { test, expect } from '@playwright/test';

const BASE = 'https://tgws.vercel.app';

test.describe('Home Page i18n', () => {
  test('EN home shows English industry names', async ({ page }) => {
    await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('Healthcare');
    await expect(page.locator('body')).toContainText('Finance');
    await expect(page.locator('body')).toContainText('Retail');
  });

  test('ZH home shows Chinese industry names', async ({ page }) => {
    await page.goto(BASE + '/zh/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('醫療健康');
    await expect(page.locator('body')).toContainText('金融服務');
    await expect(page.locator('body')).toContainText('零售業');
  });

  test('EN home does NOT show raw i18n keys', async ({ page }) => {
    await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('home.industries.healthcare.name');
    await expect(page.locator('body')).not.toContainText('home.industries.finance.name');
  });

  test('ZH home does NOT show raw i18n keys', async ({ page }) => {
    await page.goto(BASE + '/zh/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('home.industries');
  });
});

test.describe('Products Page i18n', () => {
  test('EN products shows English features', async ({ page }) => {
    await page.goto(BASE + '/en/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('Text-to-video generation');
    await expect(page.locator('body')).toContainText('Code generation');
  });

  test('ZH products shows Chinese features', async ({ page }) => {
    await page.goto(BASE + '/zh/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('文字轉視頻生成');
    await expect(page.locator('body')).toContainText('代碼生成');
  });

  test('EN products does NOT show Chinese features', async ({ page }) => {
    await page.goto(BASE + '/en/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('文字轉視頻');
  });
});
