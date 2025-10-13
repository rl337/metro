// @ts-check
const { chromium } = require('@playwright/test');

async function globalSetup() {
  console.log('🚀 Starting Metro Webapp UI Test Suite');
  
  // Create screenshots directory
  const fs = require('fs');
  const path = require('path');
  
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Test that the webapp is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8000', { timeout: 30000 });
    
    // Verify basic page elements are present
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForSelector('#cityCanvas', { timeout: 10000 });
    await page.waitForSelector('button:has-text("Generate City")', { timeout: 10000 });
    
    console.log('✅ Webapp is accessible and ready for testing');
    
    // Test basic functionality
    await page.click('button:has-text("Generate City")');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });
    
    const statusText = await page.locator('#statusText').textContent();
    if (statusText.includes('successfully')) {
      console.log('✅ Basic city generation is working');
    } else {
      console.log('⚠️  Basic city generation may have issues:', statusText);
    }
    
  } catch (error) {
    console.error('❌ Webapp setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('🎭 Playwright test suite is ready to run');
}

module.exports = globalSetup;
