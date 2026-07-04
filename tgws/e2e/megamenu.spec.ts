import { test, expect } from '@playwright/test';

const BASE = 'https://tgws.vercel.app';

test.describe('Mega Menu', () => {
  test('Products mega menu appears on hover', async ({ page }) => {
    await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    const productsLink = page.locator('nav a', { hasText: 'Products' }).first();
    await productsLink.hover();
    await page.waitForTimeout(500);

    const megaMenu = page.locator('text=Build').first();
    await expect(megaMenu).toBeVisible();
  });

  test('Solutions mega menu shows industries', async ({ page }) => {
    await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    const solutionsLink = page.locator('nav a', { hasText: 'Solutions' }).first();
    await solutionsLink.hover();
    await page.waitForTimeout(500);

    await expect(page.locator('text=Healthcare').first()).toBeVisible();
    await expect(page.locator('text=Finance').first()).toBeVisible();
  });

  test('Tickets mega menu shows auth links', async ({ page }) => {
    await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    const ticketsLink = page.locator('nav a', { hasText: 'Tickets' }).first();
    await ticketsLink.hover();
    await page.waitForTimeout(500);

    await expect(page.locator('text=Sign In').first()).toBeVisible();
    await expect(page.locator('text=Create Account').first()).toBeVisible();
  });

  test('Mega menu disappears on mouse leave', async ({ page }) => {
    await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    const productsLink = page.locator('nav a', { hasText: 'Products' }).first();
    await productsLink.hover();
    await page.waitForTimeout(500);

    const buildText = page.locator('text=Build').first();
    await expect(buildText).toBeVisible();

    await page.mouse.move(100, 100);
    await page.waitForTimeout(300);

    await expect(buildText).not.toBeVisible();
  });
});
