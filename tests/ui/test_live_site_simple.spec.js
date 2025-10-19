// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Simple Live Site Test
 * 
 * This test specifically checks for the JavaScript error that was reported
 * without complex interactions that might cause timeouts.
 */

test.describe('Live Site JavaScript Error Check', () => {
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

        // Navigate to the live site
        await page.goto('https://rl337.org/metro/');
        await page.waitForLoadState('networkidle');
    });

    test('should load without JavaScript errors', async ({ page }) => {
        // Wait for page to load
        await page.waitForTimeout(3000);

        // Check for any errors
        expect(consoleErrors).toHaveLength(0);
        expect(pageErrors).toHaveLength(0);
    });

    test('should handle city generation without infrastructure.services.forEach error', async ({ page }) => {
        // Fill in the form
        await page.fill('#seed', '1234567890');
        await page.fill('#population', '50000');
        await page.fill('#citySize', '10');
        
        // Generate city
        await page.click('button[onclick="generateCity()"]');
        
        // Wait for generation to complete (with longer timeout)
        try {
            await page.waitForSelector('#status.success', { timeout: 30000 });
        } catch (error) {
            // If it times out, check if there's an error status instead
            const errorStatus = await page.locator('#status.error').isVisible();
            if (errorStatus) {
                console.log('City generation failed, but checking for JavaScript errors...');
            }
        }

        // Check for the specific error that was reported
        const infrastructureErrors = consoleErrors.filter(error => 
            error.message.includes('infrastructure.services.forEach') ||
            error.message.includes('is not a function') ||
            error.message.includes('Cannot read properties of undefined') ||
            error.message.includes('services.forEach')
        );

        expect(infrastructureErrors).toHaveLength(0);
        
        // Also check for any other JavaScript errors
        const allErrors = consoleErrors.filter(error => 
            error.message.includes('Error generating city') ||
            error.message.includes('null is not an object') ||
            error.message.includes('Cannot read property')
        );

        expect(allErrors).toHaveLength(0);
    });

    test('should handle malformed data gracefully', async ({ page }) => {
        // Intercept the API call and return malformed data
        await page.route('**/api/simulate-city', async route => {
            const response = await route.fetch();
            const data = await response.json();
            
            // Simulate the original error condition
            if (data.layout && data.layout.infrastructure) {
                data.layout.infrastructure.services = null;
            }
            
            await route.fulfill({
                response,
                body: JSON.stringify(data)
            });
        });

        await page.fill('#seed', '9999999999');
        await page.fill('#population', '30000');
        await page.fill('#citySize', '8');
        await page.click('button[onclick="generateCity()"]');
        
        // Wait a bit for any errors to surface
        await page.waitForTimeout(5000);

        // Check for the specific error that was reported
        const infrastructureErrors = consoleErrors.filter(error => 
            error.message.includes('infrastructure.services.forEach') ||
            error.message.includes('is not a function') ||
            error.message.includes('Cannot read properties of null')
        );

        expect(infrastructureErrors).toHaveLength(0);
    });
});
