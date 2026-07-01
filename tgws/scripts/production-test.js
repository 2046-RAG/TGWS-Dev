// @ts-check
const { chromium } = require('playwright');

const BASE_URL = 'https://tgws.vercel.app';
const results = [];

async function testPage(page, path, expectedContent) {
  const url = `${BASE_URL}${path}`;
  const startTime = Date.now();
  
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    const status = response?.status() || 0;
    const title = await page.title();
    const bodyText = await page.textContent('body');
    
    const hasContent = expectedContent.some(text => bodyText?.includes(text));
    const hasError = bodyText?.includes('Something went wrong') || bodyText?.includes('Error');
    
    const result = {
      path,
      status,
      loadTime,
      title,
      hasContent,
      hasError,
      passed: status === 200 && !hasError && loadTime < 5000
    };
    
    results.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${path} - ${status} - ${loadTime}ms ${hasError ? '(ERROR)' : ''}`);
    
    return result;
  } catch (error) {
    const result = {
      path,
      status: 0,
      loadTime: Date.now() - startTime,
      title: '',
      hasContent: false,
      hasError: true,
      passed: false,
      error: error.message
    };
    results.push(result);
    console.log(`❌ ${path} - FAILED: ${error.message}`);
    return result;
  }
}

async function testLinks(page, path) {
  const url = `${BASE_URL}${path}`;
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    const links = await page.$$eval('a[href]', (els) => 
      els.map(el => ({
        href: el.getAttribute('href'),
        text: el.textContent?.trim().substring(0, 50)
      })).filter(l => l.href && (l.href.startsWith('/') || l.href.startsWith('http')))
    );
    
    const internalLinks = links.filter(l => l.href?.startsWith('/') && !l.href?.startsWith('//'));
    
    console.log(`\n📍 ${path} - 发现 ${internalLinks.length} 个内部链接`);
    
    for (const link of internalLinks.slice(0, 10)) { // 只测试前10个
      const fullUrl = link.href?.startsWith('http') ? link.href : `${BASE_URL}${link.href}`;
      try {
        const resp = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
        const status = resp?.status() || 0;
        const hasError = (await page.textContent('body'))?.includes('Something went wrong');
        console.log(`  ${status === 200 && !hasError ? '✅' : '❌'} ${link.href} → ${status} ${hasError ? '(ERROR)' : ''}`);
      } catch (e) {
        console.log(`  ❌ ${link.href} → TIMEOUT`);
      }
    }
    
    return internalLinks;
  } catch (error) {
    console.log(`❌ 无法测试 ${path} 链接: ${error.message}`);
    return [];
  }
}

async function runTests() {
  console.log('=== TGWS 生产环境测试 ===');
  console.log(`目标: ${BASE_URL}`);
  console.log(`时间: ${new Date().toISOString()}\n`);
  
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // P0: 页面可访问性测试
  console.log('=== P0: 页面可访问性 ===');
  const pages = [
    { path: '/', expected: ['TechGuru'] },
    { path: '/en', expected: ['TechGuru'] },
    { path: '/en/home', expected: ['Build', 'Run', 'Protect'] },
    { path: '/en/blog', expected: ['Blog', 'News'] },
    { path: '/en/case-studies', expected: ['Case'] },
    { path: '/en/products', expected: ['Build', 'Run', 'Protect'] },
    { path: '/en/solutions', expected: ['Solution'] },
    { path: '/en/contact', expected: ['Contact'] },
    { path: '/en/about', expected: ['About'] },
    { path: '/en/support', expected: ['Support'] },
    { path: '/en/support/login', expected: ['Sign', 'Login'] },
    { path: '/en/support/register', expected: ['Register', 'Create'] },
    { path: '/en/privacy', expected: ['Privacy'] },
    { path: '/en/terms', expected: ['Terms'] },
  ];
  
  for (const p of pages) {
    await testPage(page, p.path, p.expected);
  }
  
  // P1: 链接测试
  console.log('\n=== P1: 链接测试 ===');
  await testLinks(page, '/en/home');
  await testLinks(page, '/en/blog');
  await testLinks(page, '/en/case-studies');
  
  // 截图首页
  await page.goto(`${BASE_URL}/en/home`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: 'test-screenshot-home.png', fullPage: false });
  console.log('\n📸 首页截图已保存: test-screenshot-home.png');
  
  // 截图博客页
  await page.goto(`${BASE_URL}/en/blog`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: 'test-screenshot-blog.png', fullPage: false });
  console.log('📸 博客页截图已保存: test-screenshot-blog.png');
  
  // 截图案例页
  await page.goto(`${BASE_URL}/en/case-studies`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: 'test-screenshot-cases.png', fullPage: false });
  console.log('📸 案例页截图已保存: test-screenshot-cases.png');
  
  await browser.close();
  
  // 汇总
  console.log('\n=== 测试汇总 ===');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`通过: ${passed}/${results.length}`);
  console.log(`失败: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n失败页面:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.path}: ${r.error || '状态码' + r.status}`);
    });
  }
}

runTests().catch(console.error);