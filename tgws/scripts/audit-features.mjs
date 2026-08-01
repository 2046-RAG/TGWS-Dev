// Interactive feature probe — TCO calculator, global search, contact form validation.
import { chromium } from '@playwright/test';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: EDGE });
  // ---------- TCO CALCULATOR ----------
  const tco = { steps: [], ok: false, svg: false, tableRows: 0, png: false, err: [] };
  const tcoCtx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const tcoPage = await tcoCtx.newPage();
  tcoPage.on('console', m => { if (m.type() === 'error') tco.err.push(m.text().slice(0, 150)); });
  tcoPage.on('pageerror', e => tco.err.push('PAGEERR:' + String(e).slice(0, 150)));
  try {
    await tcoPage.goto(BASE + '/en/vmware-alternative', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await tcoPage.waitForTimeout(2500);
    // locate TCO calculator section
    const calcHeading = await tcoPage.getByText('Calculate Your VMware Alternative TCO').count();
    tco.steps.push({ step: 'section visible', value: calcHeading > 0 });
    // scenario buttons + calculate button
    const calcBtn = tcoPage.getByRole('button', { name: /Calculate TCO/ });
    tco.steps.push({ step: 'calculate button present', value: await calcBtn.count() > 0 });
    // adjust cores slider via keyboard on range input
    const coresRange = tcoPage.locator('input[type=range]').first();
    if (await coresRange.count()) {
      await coresRange.fill('32');
      tco.steps.push({ step: 'set cores 32', value: true });
    }
    // click calculate
    if (await calcBtn.count()) {
      await calcBtn.click();
      await tcoPage.waitForTimeout(1500);
      tco.ok = true;
    }
    // chart svg
    tco.svg = await tcoPage.locator('#tco-chart svg').count() > 0;
    // table rows
    tco.tableRows = await tcoPage.locator('#tco-chart').locator('xpath=..').locator('table tbody tr').count().catch(() => 0);
    if (tco.tableRows === 0) {
      tco.tableRows = await tcoPage.locator('table tbody tr').count();
    }
    // export PNG button
    const pngBtn = tcoPage.getByRole('button', { name: /Export PNG/ });
    tco.steps.push({ step: 'export png button present', value: await pngBtn.count() > 0 });
    if (await pngBtn.count()) {
      const dlPromise = tcoPage.waitForEvent('download', { timeout: 8000 }).catch(() => null);
      await pngBtn.click();
      const dl = await dlPromise;
      tco.png = !!dl;
      tco.steps.push({ step: 'png download triggered', value: !!dl });
    }
  } catch (e) { tco.err.push('CATCH:' + String(e).slice(0, 150)); }
  await tcoCtx.close();
  console.log('TCO_RESULT:' + JSON.stringify(tco));

  // ---------- GLOBAL SEARCH ----------
  const search = { steps: [], err: [] };
  const sCtx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const sPage = await sCtx.newPage();
  sPage.on('console', m => { if (m.type() === 'error') search.err.push(m.text().slice(0, 150)); });
  try {
    await sPage.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await sPage.waitForTimeout(1000);
    const searchBtn = sPage.locator('button[title="Search"]');
    search.steps.push({ step: 'navbar search button', value: await searchBtn.count() > 0 });
    await searchBtn.click();
    await sPage.waitForTimeout(800);
    const input = sPage.locator('input[type=text]').first();
    search.steps.push({ step: 'search modal input visible', value: await input.isVisible() });
    // type query
    await input.fill('VMware alternatives');
    await sPage.waitForTimeout(1200); // debounce 500ms + search
    const internalHeader = await sPage.getByText(/TechGuru \(\d+ results\)/).count();
    search.steps.push({ step: 'internal results shown', value: internalHeader > 0 });
    // suggestions header when cleared
    await input.fill('');
    await sPage.waitForTimeout(300);
    const trending = await sPage.getByText('Trending & Recommended').count();
    search.steps.push({ step: 'trending suggestions', value: trending > 0 });
    // external degradation indicator (web search unavailable) — expected since no Tavily key locally
    await input.fill('cybersecurity');
    await sPage.waitForTimeout(1200);
    const degradeInd = await sPage.getByText('AI-enhanced web search is currently unavailable').count();
    search.steps.push({ step: 'external degradation indicator', value: degradeInd > 0 });
    const hasAiSummary = await sPage.getByText(/AI Summary|Summary/i).count();
    search.steps.push({ step: 'ai summary label present', value: hasAiSummary > 0 });
    // escape closes
    await sPage.keyboard.press('Escape');
    await sPage.waitForTimeout(500);
    search.steps.push({ step: 'modal closed on Escape', value: !(await sPage.locator('input[type=text]').first().isVisible().catch(() => false)) });
  } catch (e) { search.err.push('CATCH:' + String(e).slice(0, 150)); }
  await sCtx.close();
  console.log('SEARCH_RESULT:' + JSON.stringify(search));

  // ---------- CONTACT FORM VALIDATION ----------
  const contact = { steps: [], err: [] };
  const cCtx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const cPage = await cCtx.newPage();
  cPage.on('console', m => { if (m.type() === 'error') contact.err.push(m.text().slice(0, 150)); });
  try {
    await cPage.goto(BASE + '/en/contact', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await cPage.waitForTimeout(800);
    // submit empty → validation errors
    await cPage.getByRole('button', { name: /Send|Submit/ }).click();
    await cPage.waitForTimeout(600);
    const errorAlerts = await cPage.locator('[role=alert]').count();
    contact.steps.push({ step: 'empty submit shows errors', value: errorAlerts >= 2 });
    // invalid email
    await cPage.locator('#name').fill('Test User');
    await cPage.locator('#email').fill('not-an-email');
    await cPage.locator('#message').fill('Hello');
    await cPage.getByRole('button', { name: /Send|Submit/ }).click();
    await cPage.waitForTimeout(500);
    const emailErr = await cPage.locator('#email-error').count();
    contact.steps.push({ step: 'invalid email blocked', value: emailErr > 0 });
  } catch (e) { contact.err.push('CATCH:' + String(e).slice(0, 150)); }
  await cCtx.close();
  console.log('CONTACT_RESULT:' + JSON.stringify(contact));

  await browser.close();
})();