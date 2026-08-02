/**
 * 架构图截图脚本
 * 使用Playwright截取架构图HTML并生成PNG图片
 */

const { chromium } = require('playwright');
const path = require('path');

async function captureArchitecture() {
    console.log('Starting architecture diagram capture...');
    
    const browser = await chromium.launch({
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        headless: true,
    });
    
    const page = await browser.newPage();
    
    // 设置视口大小（宽屏，适合架构图）
    await page.setViewportSize({ width: 1600, height: 1200 });
    
    // 加载HTML文件
    const htmlPath = path.join(__dirname, '..', 'architecture-diagram.html');
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);
    
    // 等待页面加载完成
    await page.waitForTimeout(1000);
    
    // 截图
    const screenshotPath = path.join(__dirname, '..', 'architecture-diagram.png');
    await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: 'png',
    });
    
    console.log(`Architecture diagram saved to: ${screenshotPath}`);
    
    await browser.close();
}

captureArchitecture().catch(console.error);