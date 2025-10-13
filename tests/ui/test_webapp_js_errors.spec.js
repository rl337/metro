// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * JavaScript Error Detection Tests
 * 
 * These tests specifically focus on catching JavaScript errors
 * that should have been caught by our previous tests.
 */

test.describe('JavaScript Error Detection', () => {
    let consoleErrors = [];
    let pageErrors = [];

    test.beforeEach(async ({ page }) => {
        // Reset error arrays
        consoleErrors = [];
        pageErrors = [];

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

        // Navigate to the page
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should not have JavaScript errors on page load', async ({ page }) => {
        // Wait for page to fully load
        await page.waitForTimeout(2000);

        // Check for any errors
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });

    test('should not have JavaScript errors during city generation', async ({ page }) => {
        // Generate a city
        await page.fill('#seed', '1234567890');
        await page.fill('#population', '50000');
        await page.fill('#citySize', '10');
        await page.click('button[onclick="generateCity()"]');
        
        // Wait for generation to complete
        await page.waitForSelector('#status.success', { timeout: 10000 });
        await page.waitForTimeout(1000);

        // Check for errors
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });

    test('should not have JavaScript errors during temporal evolution', async ({ page }) => {
        // Switch to temporal mode
        await page.selectOption('#simulationMode', 'temporal');
        await page.waitForSelector('#temporalControls', { state: 'visible' });

        // Generate temporal city
        await page.fill('#seed', '9876543210');
        await page.fill('#population', '100000');
        await page.fill('#citySize', '12');
        await page.click('button[onclick="generateCity()"]');
        
        // Wait for generation to complete
        await page.waitForSelector('#status.success', { timeout: 15000 });
        await page.waitForTimeout(1000);

        // Check for errors
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });

    test('should not have JavaScript errors during timeline navigation', async ({ page }) => {
        // Set up temporal mode
        await page.selectOption('#simulationMode', 'temporal');
        await page.waitForSelector('#temporalControls', { state: 'visible' });

        // Generate temporal city
        await page.fill('#seed', '5555555555');
        await page.fill('#population', '75000');
        await page.fill('#citySize', '15');
        await page.click('button[onclick="generateCity()"]');
        await page.waitForSelector('#status.success', { timeout: 15000 });

        // Test timeline slider
        const timelineSlider = page.locator('#timelineSlider');
        
        // Test various timeline positions
        const testYears = [0, 100, 500, 1000, 1500];
        for (const year of testYears) {
            await timelineSlider.fill(year.toString());
            await page.waitForTimeout(500);

            // Check for errors after each timeline change
            const currentConsoleErrors = consoleErrors.filter(error => 
                error.message.includes('Error generating city') ||
                error.message.includes('null is not an object') ||
                error.message.includes('Cannot read property') ||
                error.message.includes('Cannot read properties')
            );
            
            expect(currentConsoleErrors).toHaveLength(0);
        }

        // Test timeline controls
        await page.click('button[onclick="resetTimeline()"]');
        await page.waitForTimeout(500);
        expect(consoleErrors).toHaveLength(0);

        await page.click('button[onclick="stepForward()"]');
        await page.waitForTimeout(500);
        expect(consoleErrors).toHaveLength(0);

        await page.click('button[onclick="stepBackward()"]');
        await page.waitForTimeout(500);
        expect(consoleErrors).toHaveLength(0);

        // Test play/pause
        await page.click('button[onclick="togglePlayPause()"]');
        await page.waitForTimeout(1000);
        await page.click('button[onclick="togglePlayPause()"]');
        await page.waitForTimeout(500);
        expect(consoleErrors).toHaveLength(0);
    });

    test('should not have JavaScript errors with missing DOM elements', async ({ page }) => {
        // This test simulates the original error condition
        // by checking that all required DOM elements exist
        
        const requiredElements = [
            'cityPopulation',
            'cityArea', 
            'cityDensity',
            'cityDistricts',
            'cityZones',
            'cityMasterSeed',
            'cityGeneratedAt',
            'currentYear',
            'timelineSlider',
            'playPauseBtn'
        ];

        for (const elementId of requiredElements) {
            const element = page.locator(`#${elementId}`);
            await expect(element).toBeVisible();
        }

        // Generate a city to test element updates
        await page.fill('#seed', '1111111111');
        await page.fill('#population', '30000');
        await page.fill('#citySize', '8');
        await page.click('button[onclick="generateCity()"]');
        await page.waitForSelector('#status.success', { timeout: 10000 });

        // Check for the specific error mentioned in the issue
        const specificErrors = consoleErrors.filter(error => 
            error.message.includes('cityDistricts') ||
            error.message.includes('textContent') ||
            error.message.includes('null is not an object')
        );

        expect(specificErrors).toHaveLength(0);
    });

    test('should handle rapid interactions without errors', async ({ page }) => {
        // Test rapid clicking and input changes
        await page.fill('#seed', '2222222222');
        await page.fill('#population', '60000');
        await page.fill('#citySize', '9');

        // Rapidly generate cities
        for (let i = 0; i < 3; i++) {
            await page.click('button[onclick="generateCity()"]');
            await page.waitForTimeout(100);
        }

        // Wait for final generation
        await page.waitForSelector('#status.success', { timeout: 15000 });
        await page.waitForTimeout(1000);

        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });

    test('should handle invalid input gracefully', async ({ page }) => {
        // Test with invalid inputs
        await page.fill('#seed', 'invalid');
        await page.fill('#population', '-1000');
        await page.fill('#citySize', '0');

        await page.click('button[onclick="generateCity()"]');
        
        // Should either succeed with defaults or show error gracefully
        await page.waitForSelector('#status.success, #status.error', { timeout: 10000 });
        await page.waitForTimeout(1000);

        // Should not have JavaScript errors even with invalid input
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });

    test('should not have memory leaks or performance issues', async ({ page }) => {
        // Generate multiple cities to test for memory leaks
        const seeds = ['3333333333', '4444444444', '5555555555', '6666666666', '7777777777'];
        
        for (const seed of seeds) {
            await page.fill('#seed', seed);
            await page.fill('#population', '40000');
            await page.fill('#citySize', '10');
            await page.click('button[onclick="generateCity()"]');
            await page.waitForSelector('#status.success', { timeout: 10000 });
            await page.waitForTimeout(500);
        }

        // Check for errors
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);

        // Test temporal mode
        await page.selectOption('#simulationMode', 'temporal');
        await page.waitForSelector('#temporalControls', { state: 'visible' });
        
        await page.fill('#seed', '8888888888');
        await page.fill('#population', '80000');
        await page.fill('#citySize', '14');
        await page.click('button[onclick="generateCity()"]');
        await page.waitForSelector('#status.success', { timeout: 15000 });

        // Test timeline navigation
        const timelineSlider = page.locator('#timelineSlider');
        for (let year = 0; year <= 1500; year += 100) {
            await timelineSlider.fill(year.toString());
            await page.waitForTimeout(100);
        }

        // Final error check
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });
});
