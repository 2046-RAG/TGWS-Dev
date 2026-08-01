/**
 * Architecture Diagram Capture Script
 * Uses Playwright to screenshot the HTML architecture diagram
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
    
    // Set viewport size (widescreen for architecture diagram)
    await page.setViewportSize({ width: 1600, height: 1200 });
    
    // Load HTML file
    const htmlPath = path.join(__dirname, '..', '..', 'architecture-diagram.html');
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Take screenshot
    const screenshotPath = path.join(__dirname, '..', '..', 'architecture-diagram.png');
    await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: 'png',
    });
    
    console.log(`Architecture diagram saved to: ${screenshotPath}`);
    
    await browser.close();
}

captureArchitecture().catch(console.error);