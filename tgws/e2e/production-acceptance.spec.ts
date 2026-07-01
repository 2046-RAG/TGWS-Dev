import { test, expect } from '@playwright/test';

const BASE = 'https://tgws.vercel.app';

const pages = [
  '/en/home', '/zh/home',
  '/en/products', '/zh/products',
  '/en/solutions', '/zh/solutions',
  '/en/case-studies', '/zh/case-studies',
  '/en/blog', '/zh/blog',
  '/en/about', '/zh/about',
  '/en/contact', '/zh/contact',
  '/en/support', '/zh/support',
  '/en/support/login', '/zh/support/login',
  '/en/support/register', '/zh/support/register',
  '/en/privacy', '/zh/privacy',
  '/en/terms', '/zh/terms',
];

test.describe('Production Page Availability', () => {
  for (const p of pages) {
    test(`Page: ${p}`, async ({ page }) => {
      const res = await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 15000 });
      expect(res?.status()).toBe(200);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Navigation Links', () => {
  test('EN Navbar links have locale prefix', async ({ page }) => {
    await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded' });
    const links = page.locator('nav a[href]');
    const count = await links.count();
    let localeCount = 0;
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && href.startsWith('/en/')) localeCount++;
    }
    expect(localeCount).toBeGreaterThanOrEqual(8);
  });

  test('ZH Navbar links have locale prefix', async ({ page }) => {
    await page.goto(BASE + '/zh/home', { waitUntil: 'domcontentloaded' });
    const links = page.locator('nav a[href]');
    const count = await links.count();
    let localeCount = 0;
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && href.startsWith('/zh/')) localeCount++;
    }
    expect(localeCount).toBeGreaterThanOrEqual(8);
  });

  test('Footer links have locale prefix', async ({ page }) => {
    await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded' });
    const links = page.locator('footer a[href]');
    const count = await links.count();
    let localeCount = 0;
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && href.startsWith('/en/')) localeCount++;
    }
    expect(localeCount).toBeGreaterThanOrEqual(10);
  });
});

test.describe('Language Switching', () => {
  test('EN to ZH switch', async ({ page }) => {
    await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const btn = page.locator('button, a').filter({ hasText: /繁中/ }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/zh/');
    }
  });

  test('ZH to EN switch', async ({ page }) => {
    await page.goto(BASE + '/zh/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const btn = page.locator('button, a').filter({ hasText: /EN/ }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/en/');
    }
  });
});

test.describe('i18n Content', () => {
  test('EN home has English', async ({ page }) => {
    await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('Build. Run. Protect.');
  });

  test('ZH home has Chinese', async ({ page }) => {
    await page.goto(BASE + '/zh/home', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('構建');
  });

  test('EN privacy shows English', async ({ page }) => {
    await page.goto(BASE + '/en/privacy', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('Privacy Policy');
  });

  test('ZH privacy shows Chinese', async ({ page }) => {
    await page.goto(BASE + '/zh/privacy', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('隱私權政策');
  });

  test('EN terms shows English', async ({ page }) => {
    await page.goto(BASE + '/en/terms', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('Terms of Service');
  });

  test('ZH terms shows Chinese', async ({ page }) => {
    await page.goto(BASE + '/zh/terms', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('服務條款');
  });
});

test.describe('Detail Pages', () => {
  test('Blog detail EN', async ({ page }) => {
    const res = await page.goto(BASE + '/en/blog/vmware-broadcom-acquisition-alternatives-comparison', {
      waitUntil: 'domcontentloaded', timeout: 15000,
    });
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('VMware');
  });

  test('Blog detail ZH', async ({ page }) => {
    const res = await page.goto(BASE + '/zh/blog/vmware-broadcom-acquisition-alternatives-comparison', {
      waitUntil: 'domcontentloaded', timeout: 15000,
    });
    expect(res?.status()).toBe(200);
  });

  test('Case study detail EN', async ({ page }) => {
    const res = await page.goto(BASE + '/en/case-studies/axa-philippines-achieves-cloud-agility-with-techguru-migration', {
      waitUntil: 'domcontentloaded', timeout: 15000,
    });
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('AXA');
  });

  test('Case study detail ZH', async ({ page }) => {
    const res = await page.goto(BASE + '/zh/case-studies/axa-philippines-achieves-cloud-agility-with-techguru-migration', {
      waitUntil: 'domcontentloaded', timeout: 15000,
    });
    expect(res?.status()).toBe(200);
  });
});

test.describe('Form Accessibility', () => {
  test('Login form fields', async ({ page }) => {
    await page.goto(BASE + '/en/support/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('Register form fields', async ({ page }) => {
    await page.goto(BASE + '/en/support/register', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('Contact form fields', async ({ page }) => {
    await page.goto(BASE + '/en/contact', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('textarea').first()).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('404 page works', async ({ page }) => {
    const res = await page.goto(BASE + '/en/nonexistent-page', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(404);
  });
});
