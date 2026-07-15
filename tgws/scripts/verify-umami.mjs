import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const checks = [];

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
  const page = await browser.newPage();

  // Track network requests for Umami
  const umamiRequests = [];
  page.on('request', req => {
    if (req.url().includes('umami')) {
      umamiRequests.push({ url: req.url(), method: req.method() });
    }
  });

  // Track script execution
  const scriptLoaded = await page.evaluate(() => {
    return new Promise((resolve) => {
      // Check if Umami script tag exists
      const script = document.querySelector('script[data-website-id]');
      if (!script) {
        resolve({ found: false, reason: 'No script tag with data-website-id' });
        return;
      }

      const websiteId = script.getAttribute('data-website-id');
      const src = script.getAttribute('src');

      resolve({
        found: true,
        websiteId,
        src,
        scriptTag: script.outerHTML.substring(0, 200),
      });
    });
  });

  console.log('=== Umami Verification ===\n');

  // Check 1: Script tag exists
  console.log('1. Script Tag:');
  if (scriptLoaded.found) {
    console.log(`   ✅ Found`);
    console.log(`   Website ID: ${scriptLoaded.websiteId}`);
    console.log(`   Source: ${scriptLoaded.src}`);
    checks.push({ name: 'Script tag', pass: true });
  } else {
    console.log(`   ❌ Not found: ${scriptLoaded.reason}`);
    checks.push({ name: 'Script tag', pass: false });
  }

  // Check 2: Visit the page
  console.log('\n2. Page Visit:');
  await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log(`   ✅ Page loaded`);
  checks.push({ name: 'Page load', pass: true });

  // Check 3: Umami network requests
  console.log('\n3. Network Requests to Umami:');
  if (umamiRequests.length > 0) {
    console.log(`   ✅ ${umamiRequests.length} request(s) sent`);
    umamiRequests.forEach((r, i) => {
      console.log(`   [${i+1}] ${r.method} ${r.url.substring(0, 100)}`);
    });
    checks.push({ name: 'Network requests', pass: true });
  } else {
    console.log(`   ⚠️ No requests to Umami detected`);
    console.log(`   (May be blocked by ad blocker or script not loaded yet)`);
    checks.push({ name: 'Network requests', pass: false });
  }

  // Check 4: Umami global object
  console.log('\n4. Umami Global Object:');
  const umamiObj = await page.evaluate(() => {
    return {
      exists: typeof window.umami !== 'undefined',
      type: typeof window.umami,
    };
  });
  if (umamiObj.exists) {
    console.log(`   ✅ window.umami exists (type: ${umamiObj.type})`);
    checks.push({ name: 'Global object', pass: true });
  } else {
    console.log(`   ⚠️ window.umami not found (script may use different pattern)`);
    checks.push({ name: 'Global object', pass: false });
  }

  // Check 5: Visit multiple pages
  console.log('\n5. Multi-page Tracking:');
  const pages = ['/en/blog', '/en/products', '/en/about'];
  for (const p of pages) {
    await page.goto(`https://www.techguru-it.asia${p}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log(`   ✅ Visited ${p}`);
  }
  console.log(`   Total Umami requests so far: ${umamiRequests.length}`);
  checks.push({ name: 'Multi-page tracking', pass: umamiRequests.length > 0 });

  await browser.close();

  // Summary
  console.log('\n=== Summary ===');
  const passed = checks.filter(c => c.pass).length;
  const total = checks.length;
  checks.forEach(c => {
    console.log(`  ${c.pass ? '✅' : '⚠️'} ${c.name}`);
  });
  console.log(`\nResult: ${passed}/${total} checks passed`);

  if (passed < total) {
    console.log('\nNote: Some checks may fail due to:');
    console.log('- Headless browser detection by Umami');
    console.log('- Ad blocker interference');
    console.log('- Script loading timing');
    console.log('\nVerify manually at: https://cloud.umami.is/dashboard');
  }
})();
