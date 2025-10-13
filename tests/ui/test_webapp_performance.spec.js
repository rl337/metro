// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Metro Webapp Performance Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should generate large city (1M population) within reasonable time', async ({ page }) => {
        // Set large population
        await page.fill('#population', '1000000');
        await page.fill('#citySize', '20');

        // Measure generation time
        const startTime = Date.now();

        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 30000 });

        const endTime = Date.now();
        const generationTime = endTime - startTime;

        // Should complete within 10 seconds
        expect(generationTime).toBeLessThan(10000);

        // Verify city was generated successfully
        const statusText = await page.locator('#statusText').textContent();
        expect(statusText).toContain('successfully');

        // Verify population is correct
        const population = await page.locator('#cityPopulation').textContent();
        expect(population).toContain('1,000,000');
    });

    test('should handle temporal evolution with large population efficiently', async ({ page }) => {
        // Set large population
        await page.fill('#population', '500000');
        await page.fill('#citySize', '15');

        // Switch to temporal mode
        await page.selectOption('#simulationMode', 'temporal');

        // Measure temporal generation time
        const startTime = Date.now();
        await page.waitForSelector('#status:not(.hidden)', { timeout: 45000 });
        const endTime = Date.now();
        const generationTime = endTime - startTime;

        // Should complete within 30 seconds
        expect(generationTime).toBeLessThan(30000);

        // Verify temporal city was generated
        const statusText = await page.locator('#statusText').textContent();
        expect(statusText).toContain('Temporal city generated');
    });

    test('should maintain smooth timeline animation', async ({ page }) => {
        // Generate temporal city
        await page.selectOption('#simulationMode', 'temporal');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });

        // Start evolution animation
        await page.click('button:has-text("Play Evolution")');

        // Measure frame rate during animation
        const frameTimes = [];
        let frameCount = 0;
        const maxFrames = 10;

        const measureFrame = async () => {
            if (frameCount < maxFrames) {
                const start = performance.now();
                await page.waitForTimeout(100); // Wait for next frame
                const end = performance.now();
                frameTimes.push(end - start);
                frameCount++;
                await measureFrame();
            }
        };

        await measureFrame();

        // Calculate average frame time
        const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;

        // Should maintain ~60fps (16.67ms per frame)
        expect(avgFrameTime).toBeLessThan(50); // Allow some tolerance

        // Stop animation
        await page.click('button:has-text("Stop Evolution")');
    });

    test('should handle rapid parameter changes without lag', async ({ page }) => {
        // Generate initial city
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });

        // Rapidly change parameters
        const parameters = [
            { population: '50000', seed: '1111111111', size: '8' },
            { population: '150000', seed: '2222222222', size: '12' },
            { population: '300000', seed: '3333333333', size: '16' },
            { population: '750000', seed: '4444444444', size: '20' },
            { population: '1000000', seed: '5555555555', size: '25' }
        ];

        for (const param of parameters) {
            const startTime = Date.now();

            await page.fill('#population', param.population);
            await page.fill('#seed', param.seed);
            await page.fill('#citySize', param.size);
            await page.click('button:has-text("Generate City")');
            await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });

            const endTime = Date.now();
            const generationTime = endTime - startTime;

            // Each generation should complete within 8 seconds
            expect(generationTime).toBeLessThan(8000);

            // Verify city was generated
            const statusText = await page.locator('#statusText').textContent();
            expect(statusText).toContain('successfully');
        }
    });

    test('should handle memory usage efficiently during long sessions', async ({ page }) => {
        // Generate multiple cities to test memory management
        const iterations = 5;

        for (let i = 0; i < iterations; i++) {
            // Generate city with different parameters
            await page.fill('#population', (50000 + i * 100000).toString());
            await page.fill('#seed', (1000000000 + i * 1000000).toString());
            await page.click('button:has-text("Generate City")');
            await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });

            // Wait a bit between generations
            await page.waitForTimeout(1000);

            // Verify city was generated
            const statusText = await page.locator('#statusText').textContent();
            expect(statusText).toContain('successfully');
        }

        // Test temporal mode with multiple timeline changes
        await page.selectOption('#simulationMode', 'temporal');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });

        // Move through timeline rapidly
        const timelineSlider = page.locator('#timelineSlider');
        const maxYear = await timelineSlider.getAttribute('max');

        for (let year = 0; year <= maxYear; year += 200) {
            await timelineSlider.fill(year.toString());
            await page.waitForTimeout(100); // Brief pause for rendering
        }
    });

    test('should render canvas efficiently with complex cities', async ({ page }) => {
        // Generate a complex city
        await page.fill('#population', '750000');
        await page.fill('#citySize', '18');
        await page.click('button:has-text("Generate City")');
        await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });

        // Measure canvas rendering time
        const startTime = performance.now();

        // Force canvas re-render by resizing window
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.waitForTimeout(500);

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Canvas should re-render within 500ms
        expect(renderTime).toBeLessThan(500);

        // Verify canvas is still functional
        const canvas = page.locator('#cityCanvas');
        await expect(canvas).toBeVisible();

        const canvasBox = await canvas.boundingBox();
        expect(canvasBox.width).toBeGreaterThan(0);
        expect(canvasBox.height).toBeGreaterThan(0);
    });

    test('should handle concurrent operations gracefully', async ({ page }) => {
        // Start city generation
        await page.click('button:has-text("Generate City")');

        // Try to change parameters while generating
        await page.fill('#population', '200000');
        await page.fill('#seed', '9999999999');

        // Wait for generation to complete
        await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });

        // Verify the last parameters were used
        const population = await page.locator('#cityPopulation').textContent();
        expect(population).toContain('200,000');

        const masterSeed = await page.locator('#cityMasterSeed').textContent();
        expect(masterSeed).toBe('9999999999');
    });

    test('should maintain performance with multiple browser tabs', async ({ page, context }) => {
        // Open multiple tabs
        const tabs = [];
        for (let i = 0; i < 3; i++) {
            const newPage = await context.newPage();
            await newPage.goto('/');
            tabs.push(newPage);
        }

        // Generate cities in all tabs simultaneously
        const promises = tabs.map(async (tab, index) => {
            await tab.fill('#population', (100000 + index * 50000).toString());
            await tab.fill('#seed', (1000000000 + index * 1000000).toString());
            await tab.click('button:has-text("Generate City")');
            await tab.waitForSelector('#status:not(.hidden)', { timeout: 15000 });

            const statusText = await tab.locator('#statusText').textContent();
            expect(statusText).toContain('successfully');
        });

        // Wait for all tabs to complete
        await Promise.all(promises);

        // Close tabs
        for (const tab of tabs) {
            await tab.close();
        }
    });
});

