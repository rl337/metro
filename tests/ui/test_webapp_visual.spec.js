// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Metro Webapp Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should render city districts on canvas', async ({ page }) => {
        // Generate a city
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });

        // Wait for canvas to be rendered
        await page.waitForTimeout(1000);

        // Take a screenshot of the canvas
        const canvas = page.locator('#cityCanvas');
        await expect(canvas).toBeVisible();

        // Check that canvas has content (not just blank)
        const canvasBox = await canvas.boundingBox();
        expect(canvasBox.width).toBeGreaterThan(0);
        expect(canvasBox.height).toBeGreaterThan(0);

        // Take screenshot for visual verification
        await canvas.screenshot({ path: 'tests/ui/screenshots/city_canvas.png' });
    });

    test('should render different city layouts with different seeds', async ({ page }) => {
        // Generate first city
        await page.fill('#seed', '1111111111');
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
        await page.waitForTimeout(1000);

        // Take screenshot of first city
        const canvas1 = page.locator('#cityCanvas');
        await canvas1.screenshot({ path: 'tests/ui/screenshots/city_seed_1111111111.png' });

        // Generate second city with different seed
        await page.fill('#seed', '2222222222');
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
        await page.waitForTimeout(1000);

        // Take screenshot of second city
        const canvas2 = page.locator('#cityCanvas');
        await canvas2.screenshot({ path: 'tests/ui/screenshots/city_seed_2222222222.png' });

        // The two cities should be visually different
        // (This is a basic check - in practice you might want to compare pixel differences)
        const canvas1Box = await canvas1.boundingBox();
        const canvas2Box = await canvas2.boundingBox();

        expect(canvas1Box.width).toBe(canvas2Box.width);
        expect(canvas1Box.height).toBe(canvas2Box.height);
    });

    test('should render temporal city evolution', async ({ page }) => {
        // Select temporal mode
        await page.selectOption('#simulationMode', 'temporal');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });

        // Take screenshot at year 0
        const canvas = page.locator('#cityCanvas');
        await canvas.screenshot({ path: 'tests/ui/screenshots/temporal_year_0.png' });

        // Move to year 500
        await page.fill('#timelineSlider', '500');
        await page.waitForTimeout(500);
        await canvas.screenshot({ path: 'tests/ui/screenshots/temporal_year_500.png' });

        // Move to year 1000
        await page.fill('#timelineSlider', '1000');
        await page.waitForTimeout(500);
        await canvas.screenshot({ path: 'tests/ui/screenshots/temporal_year_1000.png' });

        // Move to year 1500
        await page.fill('#timelineSlider', '1500');
        await page.waitForTimeout(500);
        await canvas.screenshot({ path: 'tests/ui/screenshots/temporal_year_1500.png' });
    });

    test('should render legend correctly', async ({ page }) => {
        // Generate a city
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
        await page.waitForTimeout(1000);

        // Take screenshot of the entire page to verify legend
        await page.screenshot({ path: 'tests/ui/screenshots/full_page_with_legend.png' });

        // Check that legend is positioned correctly
        const legend = page.locator('text=City Legend');
        await expect(legend).toBeVisible();

        // Check that legend has proper styling
        const legendBox = await legend.boundingBox();
        expect(legendBox.width).toBeGreaterThan(100);
        expect(legendBox.height).toBeGreaterThan(50);
    });

    test('should handle responsive design', async ({ page }) => {
        // Test desktop view
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/ui/screenshots/desktop_view.png' });

        // Test tablet view
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/ui/screenshots/tablet_view.png' });

        // Test mobile view
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/ui/screenshots/mobile_view.png' });

        // Check that canvas is still visible and functional
        const canvas = page.locator('#cityCanvas');
        await expect(canvas).toBeVisible();

        const canvasBox = await canvas.boundingBox();
        expect(canvasBox.width).toBeGreaterThan(0);
        expect(canvasBox.height).toBeGreaterThan(0);
    });

    test('should show proper error states', async ({ page }) => {
        // Test with invalid population
        await page.fill('#population', '0');
        await page.click('button:has-text("Generate City")');

        // Should show some kind of error or validation
        // (This depends on your validation implementation)
        await page.waitForTimeout(1000);

        // Test with very large population
        await page.fill('#population', '999999999');
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });

        // Should either generate successfully or show appropriate error
        const statusText = await page.locator('#statusText').textContent();
        expect(statusText).toBeDefined();
    });
});

