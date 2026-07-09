import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: false,
  });
  
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  // Throttle network to simulate slow loading
  const context = page.context();
  await context.route('**/*.mp4', async route => {
    await new Promise(r => setTimeout(r, 3000)); // 3 second delay for video
    await route.continue();
  });
  
  console.log('Navigating with throttled video...');
  await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'domcontentloaded' });
  
  // Screenshot immediately (video not loaded)
  await page.screenshot({ path: 'hero-1-dom.png' });
  console.log('Screenshot 1: DOMContentLoaded (video loading)');
  
  // Wait 1 second
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'hero-2-1sec.png' });
  console.log('Screenshot 2: After 1 second');
  
  // Wait for video to load
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'hero-3-loaded.png' });
  console.log('Screenshot 3: After full load');
  
  // Check hero section styles
  const heroInfo = await page.evaluate(() => {
    const hero = document.querySelector('section');
    const video = document.querySelector('video');
    const nav = document.querySelector('nav');
    const main = document.querySelector('main');
    return {
      hero: hero ? { top: hero.getBoundingClientRect().top, height: hero.offsetHeight, display: getComputedStyle(hero).display } : null,
      video: video ? { readyState: video.readyState, paused: video.paused, src: video.src?.substring(0, 50) } : null,
      nav: nav ? { height: nav.offsetHeight, position: getComputedStyle(nav).position, bg: getComputedStyle(nav).background?.substring(0, 50) } : null,
      main: main ? { paddingTop: getComputedStyle(main).paddingTop } : null,
      scrollY: window.scrollY,
    };
  });
  console.log('Hero info:', JSON.stringify(heroInfo, null, 2));
  
  await browser.close();
})();
