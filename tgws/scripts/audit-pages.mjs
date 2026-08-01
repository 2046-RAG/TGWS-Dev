// Page Rendering Audit — Playwright (Edge only, per AGENTS.md #27)
// Visits every known route, captures status, render sanity, key elements, console errors, broken images.
import { chromium } from '@playwright/test';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

const routes = [
  { url: '/',                 expect: 'redirect to /en', allowRedirect: true },
  { url: '/en',                expect: 'home (re-exports home/page)', key: 'h1,h2,nav' },
  { url: '/en/home',           expect: 'homepage hero + value + ai journey + vmware + social proof', key: 'h2' },
  { url: '/en/products',       expect: 'products list (Sanity)', key: 'h1' },
  { url: '/en/products/build', expect: 'build category page', key: 'h1' },
  { url: '/en/products/run',   expect: 'run category page', key: 'h1' },
  { url: '/en/products/protect',expect: 'protect category page', key: 'h1' },
  { url: '/en/solutions',      expect: 'industry solutions tabs', key: 'h1' },
  { url: '/en/blog',           expect: 'blog list (Sanity)', key: 'h1' },
  { url: '/en/about',          expect: 'about us', key: 'h1' },
  { url: '/en/about/timeline',expect: 'company timeline', key: 'h1' },
  { url: '/en/compare',        expect: 'VMware comparison table', key: 'h1' },
  { url: '/en/vmware-alternative', expect: 'VMware alt + TCO calculator', key: 'h1' },
  { url: '/en/help',           expect: 'help center FAQ + search', key: 'h1' },
  { url: '/en/contact',        expect: 'contact form + offices', key: 'form' },
  { url: '/en/support',        expect: 'support portal (redirects to login if no auth)', key: 'h1', allowRedirect: true },
  { url: '/en/support/login',  expect: 'login form', key: 'form' },
  { url: '/en/support/register', expect: 'register form', key: 'form' },
  { url: '/en/support/admin/dashboard', expect: 'admin dashboard (auth gate)', key: 'h1' },
  { url: '/en/profile',        expect: 'profile (auth gate)', key: 'h1' },
  { url: '/en/terms',         expect: 'terms of service', key: 'h1' },
  { url: '/en/privacy',       expect: 'privacy policy', key: 'h1' },
  // dynamic slug routes — try one plausible slug, expect either 200 or 404(notFound), not a crash
  { url: '/en/blog/sample',   expect: 'blog detail or 404', key: 'h1' },
  { url: '/en/nonexistent-page', expect: '404 not-found', key: 'h1', expectStatus: 404 },
];

function short(s, n=160){ s=(s||'').replace(/\s+/g,' ').trim(); return s.length>n? s.slice(0,n)+'…' : s; }

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: EDGE });
  const results = [];
  for (const r of routes) {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, ignoreHTTPSErrors: true });
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(short(m.text(), 200)); });
    page.on('pageerror', e => pageErrors.push(short(String(e), 200)));

    let status = null, finalUrl = r.url, navError = null;
    try {
      const resp = await page.goto(BASE + r.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      status = resp ? resp.status() : null;
      finalUrl = page.url();
      await page.waitForTimeout(1200);
    } catch (e) {
      navError = short(String(e), 200);
      status = status || (navError.includes('Timeout') ? 'TIMEOUT' : 'NAV_ERR');
    }

    // assess render
    let bodyLen = 0, h1 = '', h2count = 0, hasNav = false, brokenImgs = 0, totalImgs = 0;
    let is404 = false, isErrorScreen = false, blank = false;
    try {
      bodyLen = (await page.content()).length;
      h1 = await page.locator('h1').first().innerText().catch(() => '');
      h2count = await page.locator('h2').count();
      hasNav = await page.locator('nav').first().isVisible().catch(() => false);
      totalImgs = await page.locator('img').count();
      // broken image detection: naturalWidth 0 (only for imgs that have loaded/failed)
      if (totalImgs > 0) {
        brokenImgs = await page.evaluate(() => {
          return Array.from(document.images).filter(i => !i.complete || i.naturalWidth === 0).length;
        });
      }
      is404 = await page.locator('text=404').first().isVisible().catch(() => false);
      const mainText = await page.locator('main').first().innerText().catch(() => '');
      blank = mainText.replace(/\s/g,'').length < 20 && !isErrorScreen;
    } catch {}

    // special pass/fail logic
    let verdict = 'PASS';
    if (pageErrors.length > 0) verdict = 'FAIL(pageerr)';
    else if (r.expectStatus && status !== r.expectStatus) verdict = `FAIL(status ${status} != ${r.expectStatus})`;
    else if (blank) verdict = 'FAIL(blank)';
    else if (r.expectStatus === 404 && status === 404) verdict = 'PASS';
    else if (status && Number(status) >= 500) verdict = `FAIL(${status})`;
    else if (status && Number(status) >= 400 && !r.expectStatus && !r.allowRedirect && !is404) verdict = `WARN(${status})`;

    results.push({
      route: r.url, expect: r.expect, status, finalUrl: finalUrl === r.url ? '' : finalUrl,
      verdict, bodyLen, h1: short(h1, 80), h2count, hasNav, totalImgs, brokenImgs,
      pageErrors, consoleErrors: consoleErrors.slice(0, 5),
    });
    await ctx.close();
    process.stdout.write('.');
  }
  await browser.close();
  console.log('\n' + JSON.stringify(results, null, 2));
  // also write JSON
  const fs = await import('node:fs');
  fs.writeFileSync('D:/软件集/Vibe Coding/Mimo Space/TGWS/tgws/audit-results.json', JSON.stringify(results, null, 2));
  const fail = results.filter(r => r.verdict.startsWith('FAIL'));
  console.log(`\nSUMMARY: ${results.length} routes | ${results.filter(r=>r.verdict==='PASS').length} PASS | ${fail.length} FAIL`);
})();