import { chromium } from 'playwright';

// 测试认证验证链接问题
async function testAuthVerification() {
  console.log('=== TGWS 认证验证链接测试 ===\n');
  
  // 测试1: 检查注册页面是否可访问
  console.log('测试1: 检查注册页面...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // 访问注册页面
    await page.goto('https://www.techguru-it.asia/en/support/register', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('✅ 注册页面可访问');
    console.log('   URL:', page.url());
    
    // 截图注册页面
    await page.screenshot({ 
      path: 'D:\\软件集\\Mimo\\WorkSpace\\TGWS\\tgws\\test-register-page.png',
      fullPage: true 
    });
    console.log('   截图已保存: test-register-page.png');
    
    // 测试2: 模拟验证链接行为
    console.log('\n测试2: 模拟验证链接...');
    const testCode = '28a1db75-d331-4ff1-8b99-a2b1852100e0';
    
    // 尝试访问生产环境的验证链接格式
    const productionUrl = `https://www.techguru-it.asia/?code=${testCode}`;
    console.log('   测试URL:', productionUrl);
    
    await page.goto(productionUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('   最终URL:', page.url());
    await page.screenshot({ 
      path: 'D:\\软件集\\Mimo\\WorkSpace\\TGWS\\tgws\\test-verification-result.png',
      fullPage: true 
    });
    console.log('   截图已保存: test-verification-result.png');
    
    // 测试3: 检查Supabase回调路由
    console.log('\n测试3: 检查Supabase回调路由...');
    const callbackUrl = `https://www.techguru-it.asia/api/auth/callback?code=${testCode}`;
    console.log('   回调URL:', callbackUrl);
    
    await page.goto(callbackUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('   最终URL:', page.url());
    await page.screenshot({ 
      path: 'D:\\软件集\\Mimo\\WorkSpace\\TGWS\\tgws\\test-callback-result.png',
      fullPage: true 
    });
    console.log('   截图已保存: test-callback-result.png');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n=== 测试完成 ===');
}

testAuthVerification();