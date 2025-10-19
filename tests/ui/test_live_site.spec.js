// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Live Site Evaluation Tests
 * 
 * These tests specifically target the live deployment at https://rl337.org/metro/
 * to catch production issues that may not be present in local development.
 */

test.describe('Live Site Evaluation', () => {
    let consoleErrors = [];
    let pageErrors = [];
    let networkErrors = [];

    test.beforeEach(async ({ page }) => {
        // Reset error arrays
        consoleErrors = [];
        pageErrors = [];
        networkErrors = [];

        // Set up error listeners
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push({
                    type: 'console',
                    message: msg.text(),
                    location: msg.location()
                });
            }
        });

        page.on('pageerror', error => {
            pageErrors.push({
                type: 'page',
                message: error.message,
                stack: error.stack
            });
        });

        page.on('response', response => {
            if (!response.ok()) {
                networkErrors.push({
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                });
            }
        });

        // Navigate to the live site
        await page.goto('https://rl337.org/metro/');
        await page.waitForLoadState('networkidle');
    });

    test('should load the live site without errors', async ({ page }) => {
        // Wait for page to fully load
        await page.waitForTimeout(3000);

        // Check for any errors
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
        expect(networkErrors).toHaveLength(0);

        // Verify the page title and main elements
        await expect(page).toHaveTitle('Metro City Generator');

        // Check that main UI elements are present
        await expect(page.locator('h1')).toContainText('Metro City Generator');
        await expect(page.locator('#population')).toBeVisible();
        await expect(page.locator('#seed')).toBeVisible();
        await expect(page.locator('#citySize')).toBeVisible();
        await expect(page.locator('#cityCanvas')).toBeVisible();
    });

    test('should generate a city without JavaScript errors', async ({ page }) => {
        // Fill in the form
        await page.fill('#seed', '1234567890');
        await page.fill('#population', '50000');
        await page.fill('#citySize', '10');

        // Generate city
        await page.click('button[onclick="generateCity()"]');

        // Wait for generation to complete
        await page.waitForSelector('#status.success', { timeout: 15000 });
        await page.waitForTimeout(2000);

        // Check for specific errors that were reported
        const infrastructureErrors = consoleErrors.filter(error =>
            error.message.includes('infrastructure.services.forEach') ||
            error.message.includes('is not a function') ||
            error.message.includes('Cannot read properties of undefined') ||
            error.message.includes('services.forEach')
        );

        expect(infrastructureErrors).toHaveLength(0);
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });

    test('should display streets and zones properly', async ({ page }) => {
        // Generate a city
        await page.fill('#seed', '9876543210');
        await page.fill('#population', '75000');
        await page.fill('#citySize', '12');
        await page.click('button[onclick="generateCity()"]');

        await page.waitForSelector('#status.success', { timeout: 15000 });
        await page.waitForTimeout(2000);

        // Check that city info is populated
        const population = await page.locator('#cityPopulation').textContent();
        const area = await page.locator('#cityArea').textContent();
        const districts = await page.locator('#cityDistricts').textContent();
        const zones = await page.locator('#cityZones').textContent();

        expect(population).not.toBe('-');
        expect(area).not.toBe('-');
        expect(districts).not.toBe('-');
        expect(zones).not.toBe('-');

        // Take a screenshot for visual verification
        await page.screenshot({ path: 'test-results/live-site-city-generation.png' });

        // Check that the canvas has content (not just grey background)
        const canvas = page.locator('#cityCanvas');
        const canvasElement = await canvas.elementHandle();
        const imageData = await canvasElement.evaluate((canvas) => {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return Array.from(imageData.data);
        });

        // Check that the canvas is not just a solid color (indicating proper rendering)
        const uniqueColors = new Set();
        for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];
            uniqueColors.add(`${r},${g},${b},${a}`);
        }

        // Should have more than just background colors
        expect(uniqueColors.size).toBeGreaterThan(10);
    });

    test('should handle temporal evolution without errors', async ({ page }) => {
        // Switch to temporal mode
        await page.selectOption('#simulationMode', 'temporal');
        await page.waitForSelector('#temporalControls', { state: 'visible' });

        // Generate temporal city
        await page.fill('#seed', '5555555555');
        await page.fill('#population', '100000');
        await page.fill('#citySize', '15');
        await page.click('button[onclick="generateCity()"]');

        await page.waitForSelector('#status.success', { timeout: 20000 });
        await page.waitForTimeout(2000);

        // Test timeline navigation
        const timelineSlider = page.locator('#timelineSlider');
        await timelineSlider.fill('500');
        await page.waitForTimeout(1000);

        // Check for errors
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);

        // Test timeline controls
        await page.click('button[onclick="resetTimeline()"]');
        await page.waitForTimeout(500);
        await page.click('button[onclick="stepForward()"]');
        await page.waitForTimeout(500);

        expect(consoleErrors).toHaveLength(0);
    });

    test('should handle rapid city generation without errors', async ({ page }) => {
        // Test rapid generation with different parameters
        const testCases = [
            { seed: '1111111111', population: '30000', citySize: '8' },
            { seed: '2222222222', population: '60000', citySize: '10' },
            { seed: '3333333333', population: '90000', citySize: '12' }
        ];

        for (const testCase of testCases) {
            // Reset error arrays
            consoleErrors = [];
            pageErrors = [];

            await page.fill('#seed', testCase.seed);
            await page.fill('#population', testCase.population);
            await page.fill('#citySize', testCase.citySize);
            await page.click('button[onclick="generateCity()"]');

            await page.waitForSelector('#status.success', { timeout: 15000 });
            await page.waitForTimeout(1000);

            // Check for errors
            expect(consoleErrors).toHaveLength(0);
            expect(pageErrors).toHaveLength(0);
        }
    });

    test('should handle edge cases gracefully', async ({ page }) => {
        // Test with extreme values
        await page.fill('#seed', '9999999999');
        await page.fill('#population', '1000000');
        await page.fill('#citySize', '50');
        await page.click('button[onclick="generateCity()"]');

        // Should either succeed or show error gracefully
        await page.waitForSelector('#status.success, #status.error', { timeout: 20000 });
        await page.waitForTimeout(2000);

        // Should not have JavaScript errors even with extreme values
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });

    test('should have proper error handling for malformed data', async ({ page }) => {
        // This test simulates what happens when the backend returns unexpected data
        // by intercepting the API call and modifying the response

        await page.route('**/api/simulate-city', async route => {
            const response = await route.fetch();
            const data = await response.json();

            // Simulate malformed data that could cause the original error
            data.layout.infrastructure.services = null;

            await route.fulfill({
                response,
                body: JSON.stringify(data)
            });
        });

        await page.fill('#seed', '1234567890');
        await page.fill('#population', '50000');
        await page.fill('#citySize', '10');
        await page.click('button[onclick="generateCity()"]');

        // Should handle gracefully without JavaScript errors
        await page.waitForTimeout(5000);

        // Check for the specific error that was reported
        const infrastructureErrors = consoleErrors.filter(error =>
            error.message.includes('infrastructure.services.forEach') ||
            error.message.includes('is not a function') ||
            error.message.includes('Cannot read properties of null')
        );

        expect(infrastructureErrors).toHaveLength(0);
    });

    test('should display proper city legend', async ({ page }) => {
        // Generate a city first
        await page.fill('#seed', '4444444444');
        await page.fill('#population', '80000');
        await page.fill('#citySize', '14');
        await page.click('button[onclick="generateCity()"]');

        await page.waitForSelector('#status.success', { timeout: 15000 });
        await page.waitForTimeout(2000);

        // Check that legend elements are present
        const legendItems = [
            'Commercial Zone',
            'Residential Zone',
            'Industrial Zone',
            'Mixed Use Zone',
            'Roads & Streets',
            'Hospital',
            'School',
            'Police Station',
            'Fire Station',
            'Market'
        ];

        for (const item of legendItems) {
            await expect(page.locator('text=' + item)).toBeVisible();
        }
    });

    test('should handle network failures gracefully', async ({ page }) => {
        // Simulate network failure
        await page.route('**/api/simulate-city', route => route.abort());

        await page.fill('#seed', '5555555555');
        await page.fill('#population', '50000');
        await page.fill('#citySize', '10');
        await page.click('button[onclick="generateCity()"]');

        // Should show error status
        await page.waitForSelector('#status.error', { timeout: 10000 });

        // Should not have JavaScript errors
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });

    test('should maintain state during page interactions', async ({ page }) => {
        // Generate initial city
        await page.fill('#seed', '6666666666');
        await page.fill('#population', '60000');
        await page.fill('#citySize', '11');
        await page.click('button[onclick="generateCity()"]');

        await page.waitForSelector('#status.success', { timeout: 15000 });
        await page.waitForTimeout(1000);

        // Interact with various controls
        await page.click('button[onclick="exportCity()"]');
        await page.waitForTimeout(500);

        await page.click('button[onclick="loadDefaultCity()"]');
        await page.waitForTimeout(2000);

        // Check for errors
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });
});
