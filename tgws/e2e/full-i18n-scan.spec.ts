import { test, expect } from '@playwright/test';

const BASE = 'https://tgws.vercel.app';

const pages = [
  { path: '/en/home', zhPath: '/zh/home', name: 'Home', enText: 'Build. Run. Protect.', zhText: '構建' },
  { path: '/en/products', zhPath: '/zh/products', name: 'Products', enText: 'Our Products', zhText: '產品與服務' },
  { path: '/en/solutions', zhPath: '/zh/solutions', name: 'Solutions', enText: 'Industry Solutions', zhText: '行業解決方案' },
  { path: '/en/case-studies', zhPath: '/zh/case-studies', name: 'Case Studies', enText: 'Case Studies', zhText: '案例展示' },
  { path: '/en/blog', zhPath: '/zh/blog', name: 'Blog', enText: 'News & Insights', zhText: '新聞與洞察' },
  { path: '/en/about', zhPath: '/zh/about', name: 'About', enText: 'About TechGuru', zhText: '關於泰谷科技' },
  { path: '/en/contact', zhPath: '/zh/contact', name: 'Contact', enText: 'Get In Touch', zhText: '聯絡我們' },
  { path: '/en/privacy', zhPath: '/zh/privacy', name: 'Privacy', enText: 'Privacy Policy', zhText: '隱私權政策' },
  { path: '/en/terms', zhPath: '/zh/terms', name: 'Terms', enText: 'Terms of Service', zhText: '服務條款' },
  { path: '/en/support/login', zhPath: '/zh/support/login', name: 'Login', enText: 'Sign In', zhText: '登入' },
  { path: '/en/support/register', zhPath: '/zh/support/register', name: 'Register', enText: 'Create Account', zhText: '建立帳戶' },
];

for (const p of pages) {
  test.describe(`${p.name} i18n`, () => {
    test(`EN ${p.name} shows English`, async ({ page }) => {
      await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(p.enText);
    });

    test(`ZH ${p.name} shows Chinese`, async ({ page }) => {
      await page.goto(BASE + p.zhPath, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(p.zhText);
    });
  });
}
