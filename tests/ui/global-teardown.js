// @ts-check
const fs = require('fs');
const path = require('path');

async function globalTeardown() {
    console.log('🧹 Cleaning up Metro Webapp UI Test Suite');

    // Clean up test artifacts
    const testResultsDir = path.join(__dirname, '..', '..', 'test-results');
    const screenshotsDir = path.join(__dirname, 'screenshots');

    // Remove old test results (keep only last 5 runs)
    if (fs.existsSync(testResultsDir)) {
        const files = fs.readdirSync(testResultsDir);
        const testRunDirs = files.filter(file =>
            fs.statSync(path.join(testResultsDir, file)).isDirectory()
        ).sort();

        // Keep only the last 5 test runs
        if (testRunDirs.length > 5) {
            const dirsToRemove = testRunDirs.slice(0, -5);
            for (const dir of dirsToRemove) {
                const dirPath = path.join(testResultsDir, dir);
                fs.rmSync(dirPath, { recursive: true, force: true });
                console.log(`🗑️  Removed old test results: ${dir}`);
            }
        }
    }

    // Clean up old screenshots (keep only last 10 sets)
    if (fs.existsSync(screenshotsDir)) {
        const files = fs.readdirSync(screenshotsDir);
        const screenshotFiles = files.filter(file => file.endsWith('.png'));

        if (screenshotFiles.length > 50) { // Keep last 50 screenshots
            const filesToRemove = screenshotFiles.slice(0, -50);
            for (const file of filesToRemove) {
                fs.unlinkSync(path.join(screenshotsDir, file));
            }
            console.log(`🗑️  Removed ${filesToRemove.length} old screenshots`);
        }
    }

    console.log('✅ Test cleanup completed');
    console.log('📊 Test results and screenshots preserved for review');
}

module.exports = globalTeardown;

