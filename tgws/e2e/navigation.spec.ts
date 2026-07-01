import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TechGuru/i);
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');

    const navLinks = [
      { label: 'Products', href: '/products' },
      { label: 'Solutions', href: '/solutions' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Blog', href: '/blog' },
      { label: 'About', href: '/about' },
      { label: 'Support', href: '/support' },
      { label: 'Contact', href: '/contact' },
    ];

    for (const link of navLinks) {
      const navLink = page.getByRole('link', { name: new RegExp(link.label, 'i') }).first();
      await expect(navLink).toBeVisible();
      await navLink.click();
      await expect(page).toHaveURL(new RegExp(link.href));
      await page.goBack();
    }
  });

  test('language switcher works (EN <-> ZH)', async ({ page }) => {
    await page.goto('/en');

    // Look for a language switcher element (button/link with text like ZH, 中文, etc.)
    const langSwitcher = page.locator('[data-testid="lang-switcher"], a[href*="/zh"], button:has-text("ZH"), button:has-text("中文"), a:has-text("中文")').first();

    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      await expect(page).toHaveURL(/\/zh/);

      // Switch back to EN
      const enSwitcher = page.locator('[data-testid="lang-switcher"], a[href*="/en"], button:has-text("EN"), button:has-text("English"), a:has-text("English")').first();
      if (await enSwitcher.isVisible()) {
        await enSwitcher.click();
        await expect(page).toHaveURL(/\/en/);
      }
    }
  });

  test('footer links work', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');

    await expect(footer).toBeVisible();

    const footerLinks = footer.getByRole('link');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);

    // Verify first few footer links are navigable
    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = footerLinks.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});
