import { test, expect } from '@playwright/test';

const BASE = 'https://tgws.vercel.app';

test.describe('Blog i18n Verification', () => {
  test('EN blog shows English titles', async ({ page }) => {
    await page.goto(BASE + '/en/blog', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Should NOT contain Chinese blog titles
    await expect(page.locator('body')).not.toContainText('VMware被博通收購後');
    await expect(page.locator('body')).not.toContainText('Broadcom收購VMware一年後');
    await expect(page.locator('body')).not.toContainText('2025年超融合架構市場趨勢');

    // Should contain English titles
    await expect(page.locator('body')).toContainText('VMware Post-Acquisition');
    await expect(page.locator('body')).toContainText('Broadcom VMware One Year Later');
  });

  test('ZH blog shows Chinese titles', async ({ page }) => {
    await page.goto(BASE + '/zh/blog', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Should contain Chinese content
    await expect(page.locator('body')).toContainText('VMware被博通收購後');
    await expect(page.locator('body')).toContainText('Broadcom收購VMware一年後');
  });

  test('EN blog detail shows English content', async ({ page }) => {
    await page.goto(BASE + '/en/blog/vmware-broadcom-acquisition-alternatives-comparison', {
      waitUntil: 'domcontentloaded', timeout: 15000,
    });
    await page.waitForTimeout(2000);

    // Title should be English
    const title = await page.locator('h1').first().textContent();
    expect(title).toContain('VMware');

    // Should not have Chinese title
    expect(title).not.toContain('被博通收購後');
  });

  test('ZH blog detail shows Chinese content', async ({ page }) => {
    await page.goto(BASE + '/zh/blog/vmware-broadcom-acquisition-alternatives-comparison', {
      waitUntil: 'domcontentloaded', timeout: 15000,
    });
    await page.waitForTimeout(2000);

    // Should contain Chinese text
    await expect(page.locator('body')).toContainText('Broadcom完成對VMware的收購後');
  });
});
