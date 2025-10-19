// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for testing the live site at https://rl337.org/metro/
 */
module.exports = defineConfig({
    testDir: './tests/ui',
    testMatch: 'test_live_site.spec.js',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: 'playwright-report-live' }],
        ['json', { outputFile: 'test-results-live.json' }]
    ],
    use: {
        baseURL: 'https://rl337.org',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        // Mobile testing
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],

    webServer: undefined, // No local server needed for live site testing
});
