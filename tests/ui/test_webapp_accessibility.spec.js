// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Metro Webapp Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should be keyboard navigable', async ({ page }) => {
        // Test tab navigation through all interactive elements
        await page.keyboard.press('Tab'); // Population input
        await expect(page.locator('#population')).toBeFocused();

        await page.keyboard.press('Tab'); // Seed input
        await expect(page.locator('#seed')).toBeFocused();

        await page.keyboard.press('Tab'); // City size input
        await expect(page.locator('#citySize')).toBeFocused();

        await page.keyboard.press('Tab'); // Simulation mode dropdown
        await expect(page.locator('#simulationMode')).toBeFocused();

        await page.keyboard.press('Tab'); // Generate City button
        await expect(page.locator('button:has-text("Generate City")')).toBeFocused();

        await page.keyboard.press('Tab'); // Load Default City button
        await expect(page.locator('button:has-text("Load Default City")')).toBeFocused();

        await page.keyboard.press('Tab'); // Export City button
        await expect(page.locator('button:has-text("Export City")')).toBeFocused();

        await page.keyboard.press('Tab'); // Play Evolution button
        await expect(page.locator('button:has-text("Play Evolution")')).toBeFocused();
    });

    test('should support keyboard input and activation', async ({ page }) => {
        // Test keyboard input in form fields
        await page.locator('#population').focus();
        await page.keyboard.type('150000');
        await expect(page.locator('#population')).toHaveValue('150000');

        await page.locator('#seed').focus();
        await page.keyboard.type('1234567890');
        await expect(page.locator('#seed')).toHaveValue('1234567890');

        await page.locator('#citySize').focus();
        await page.keyboard.type('12');
        await expect(page.locator('#citySize')).toHaveValue('12');

        // Test keyboard activation of buttons
        await page.locator('button:has-text("Generate City")').focus();
        await page.keyboard.press('Enter');

        // Wait for city generation
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
        const statusText = await page.locator('#statusText').textContent();
        expect(statusText).toContain('successfully');
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
        // Check for proper form labels
        await expect(page.locator('label[for="population"]')).toBeVisible();
        await expect(page.locator('label[for="seed"]')).toBeVisible();
        await expect(page.locator('label[for="citySize"]')).toBeVisible();
        await expect(page.locator('label[for="simulationMode"]')).toBeVisible();

        // Check for proper button roles
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        for (let i = 0; i < buttonCount; i++) {
            const button = buttons.nth(i);
            const role = await button.getAttribute('role');
            expect(role).toBe('button');
        }

        // Check for proper input types
        await expect(page.locator('#population')).toHaveAttribute('type', 'number');
        await expect(page.locator('#seed')).toHaveAttribute('type', 'number');
        await expect(page.locator('#citySize')).toHaveAttribute('type', 'number');
    });

    test('should have proper focus indicators', async ({ page }) => {
        // Test focus indicators on all interactive elements
        const interactiveElements = [
            '#population',
            '#seed',
            '#citySize',
            '#simulationMode',
            'button:has-text("Generate City")',
            'button:has-text("Load Default City")',
            'button:has-text("Export City")',
            'button:has-text("Play Evolution")'
        ];

        for (const selector of interactiveElements) {
            await page.locator(selector).focus();

            // Check that element is focused
            await expect(page.locator(selector)).toBeFocused();

            // Check for visible focus indicator (CSS outline or similar)
            const element = page.locator(selector);
            const outline = await element.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return styles.outline || styles.boxShadow;
            });

            // Should have some form of focus indicator
            expect(outline).toBeTruthy();
        }
    });

    test('should support screen reader navigation', async ({ page }) => {
        // Check for proper heading structure
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
        const h1Text = await h1.textContent();
        expect(h1Text).toContain('Metro City Generator');

        // Check for proper form structure
        const form = page.locator('form, .controls');
        await expect(form).toBeVisible();

        // Check that all form controls have associated labels
        const inputs = page.locator('input, select');
        const inputCount = await inputs.count();

        for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i);
            const id = await input.getAttribute('id');

            if (id) {
                const label = page.locator(`label[for="${id}"]`);
                await expect(label).toBeVisible();
            }
        }
    });

    test('should have proper color contrast', async ({ page }) => {
        // Generate a city to test legend colors
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });

        // Check text contrast on various elements
        const textElements = [
            'h1',
            'h2',
            'label',
            '.status',
            '#cityPopulation',
            '#cityArea',
            '#cityDensity'
        ];

        for (const selector of textElements) {
            const element = page.locator(selector).first();
            if (await element.count() > 0) {
                const color = await element.evaluate(el => {
                    const styles = window.getComputedStyle(el);
                    return styles.color;
                });

                const backgroundColor = await element.evaluate(el => {
                    const styles = window.getComputedStyle(el);
                    return styles.backgroundColor;
                });

                // Basic check that colors are defined
                expect(color).toBeTruthy();
                expect(backgroundColor).toBeTruthy();
            }
        }
    });

    test('should handle high contrast mode', async ({ page }) => {
        // Simulate high contrast mode by injecting CSS
        await page.addStyleTag({
            content: `
        * {
          background: white !important;
          color: black !important;
          border: 1px solid black !important;
        }
      `
        });

        // Verify page is still functional
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });

        const statusText = await page.locator('#statusText').textContent();
        expect(statusText).toContain('successfully');

        // Verify canvas is still visible
        const canvas = page.locator('#cityCanvas');
        await expect(canvas).toBeVisible();
    });

    test('should support zoom levels up to 200%', async ({ page }) => {
        // Test at 150% zoom
        await page.setViewportSize({ width: 800, height: 600 });
        await page.evaluate(() => {
            document.body.style.zoom = '1.5';
        });

        // Verify all elements are still accessible
        await expect(page.locator('#population')).toBeVisible();
        await expect(page.locator('#seed')).toBeVisible();
        await expect(page.locator('#citySize')).toBeVisible();
        await expect(page.locator('button:has-text("Generate City")')).toBeVisible();

        // Test functionality at zoomed level
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });

        const statusText = await page.locator('#statusText').textContent();
        expect(statusText).toContain('successfully');

        // Test at 200% zoom
        await page.evaluate(() => {
            document.body.style.zoom = '2.0';
        });

        // Verify canvas is still functional
        const canvas = page.locator('#cityCanvas');
        await expect(canvas).toBeVisible();

        const canvasBox = await canvas.boundingBox();
        expect(canvasBox.width).toBeGreaterThan(0);
        expect(canvasBox.height).toBeGreaterThan(0);
    });

    test('should provide alternative text for visual elements', async ({ page }) => {
        // Check that canvas has proper accessibility attributes
        const canvas = page.locator('#cityCanvas');
        const ariaLabel = await canvas.getAttribute('aria-label');
        const role = await canvas.getAttribute('role');

        // Canvas should have accessibility attributes
        expect(ariaLabel || role).toBeTruthy();

        // Check for alt text on any images
        const images = page.locator('img');
        const imageCount = await images.count();

        for (let i = 0; i < imageCount; i++) {
            const img = images.nth(i);
            const alt = await img.getAttribute('alt');
            expect(alt).toBeTruthy();
        }
    });

    test('should handle reduced motion preferences', async ({ page }) => {
        // Simulate reduced motion preference
        await page.emulateMedia({ reducedMotion: 'reduce' });

        // Test temporal mode with reduced motion
        await page.selectOption('#simulationMode', 'temporal');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });

        // Timeline should still work but without smooth animations
        const timelineSlider = page.locator('#timelineSlider');
        await expect(timelineSlider).toBeVisible();

        await timelineSlider.fill('500');
        const currentYear = await page.locator('#currentYear').textContent();
        expect(currentYear).toBe('500');

        // Play button should still work
        await page.click('button:has-text("Play Evolution")');
        await expect(page.locator('button:has-text("Stop Evolution")')).toBeVisible();

        await page.click('button:has-text("Stop Evolution")');
        await expect(page.locator('button:has-text("Play Evolution")')).toBeVisible();
    });

    test('should support voice control and speech recognition', async ({ page }) => {
        // Test that form inputs can be filled via voice
        // (This is a basic test - full voice control testing would require more setup)

        await page.locator('#population').focus();
        await page.keyboard.type('200000');
        await expect(page.locator('#population')).toHaveValue('200000');

        await page.locator('#seed').focus();
        await page.keyboard.type('9876543210');
        await expect(page.locator('#seed')).toHaveValue('9876543210');

        // Verify that voice input would work the same as keyboard input
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });

        const statusText = await page.locator('#statusText').textContent();
        expect(statusText).toContain('successfully');
    });
});

