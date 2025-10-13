// @ts-check
const fs = require('fs');
const path = require('path');

async function globalSetup() {
    console.log('🚀 Starting Metro Webapp UI Test Suite');

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Check if docs/index.html exists
    const indexPath = path.join(__dirname, '../../docs/index.html');
    if (!fs.existsSync(indexPath)) {
        throw new Error(`docs/index.html not found at ${indexPath}. Please ensure the webapp is built.`);
    }

    console.log('✅ Webapp files are present and ready for testing');
    console.log('🎭 Playwright test suite is ready to run');
}

module.exports = globalSetup;

