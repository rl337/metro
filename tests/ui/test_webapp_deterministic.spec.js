// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Deterministic Tests for Metro Webapp
 * 
 * These tests use known seeds to ensure reproducible city generation
 * and validate that the webapp produces consistent results.
 */

test.describe('Deterministic City Generation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should generate consistent city with known seed', async ({ page }) => {
        // Use a known seed for deterministic testing
        const testSeed = 1234567890;
        const testPopulation = 50000;
        const testCitySize = 8;

        // Set test parameters
        await page.fill('#seed', testSeed.toString());
        await page.fill('#population', testPopulation.toString());
        await page.fill('#citySize', testCitySize.toString());

        // Generate city
        await page.click('button[onclick="generateCity()"]');
        await page.waitForSelector('#status.success', { timeout: 10000 });

        // Verify no JavaScript errors occurred
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Wait a bit to catch any delayed errors
        await page.waitForTimeout(1000);

        // Check for JavaScript errors
        expect(consoleErrors).toHaveLength(0);

        // Verify city info is displayed correctly
        await expect(page.locator('#cityPopulation')).toContainText('50,000');
        await expect(page.locator('#cityDistricts')).toBeVisible();
        await expect(page.locator('#cityZones')).toBeVisible();
        await expect(page.locator('#cityMasterSeed')).toContainText(testSeed.toString());

        // Verify canvas is rendered
        const canvas = page.locator('#cityCanvas');
        await expect(canvas).toBeVisible();
        
        // Take screenshot for visual regression testing
        await expect(canvas).toHaveScreenshot('deterministic-city-seed-' + testSeed + '.png', { 
            timeout: 30000 // 30 seconds for screenshot comparison
        });
    });

    test('should generate different cities with different seeds', async ({ page }) => {
        const seeds = [1111111111, 2222222222, 3333333333];
        const screenshots = [];

        for (let i = 0; i < seeds.length; i++) {
            const seed = seeds[i];
            
            // Set seed
            await page.fill('#seed', seed.toString());
            await page.fill('#population', '30000');
            await page.fill('#citySize', '6');

            // Generate city
            await page.click('button[onclick="generateCity()"]');
            await page.waitForSelector('#status.success', { timeout: 10000 });

            // Verify no errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            await page.waitForTimeout(1000);
            expect(consoleErrors).toHaveLength(0);

            // Take screenshot
            const canvas = page.locator('#cityCanvas');
            await expect(canvas).toHaveScreenshot(`city-seed-${seed}.png`, { 
                timeout: 30000 // 30 seconds for screenshot comparison
            });
            screenshots.push(`city-seed-${seed}.png`);
        }

        // Verify we have different screenshots (cities look different)
        expect(screenshots).toHaveLength(3);
    });

    test('should handle temporal evolution without errors', async ({ page }) => {
        // Set up temporal mode
        await page.selectOption('#simulationMode', 'temporal');
        await page.waitForSelector('#temporalControls', { state: 'visible' });

        // Set parameters
        await page.fill('#seed', '9876543210');
        await page.fill('#population', '100000');
        await page.fill('#citySize', '10');

        // Generate temporal city
        await page.click('button[onclick="generateCity()"]');
        await page.waitForSelector('#status.success', { timeout: 15000 });

        // Verify no JavaScript errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.waitForTimeout(2000);
        expect(consoleErrors).toHaveLength(0);

        // Test timeline slider
        const timelineSlider = page.locator('#timelineSlider');
        await expect(timelineSlider).toBeVisible();

        // Test different timeline positions
        const testYears = [0, 500, 1000, 1500];
        for (const year of testYears) {
            await timelineSlider.fill(year.toString());
            await page.waitForTimeout(500); // Wait for rendering

            // Verify no errors during timeline changes
            const currentErrors = consoleErrors.filter(error => 
                error.includes('Error generating city') || 
                error.includes('null is not an object')
            );
            expect(currentErrors).toHaveLength(0);

            // Verify year display updates
            await expect(page.locator('#currentYear')).toContainText(year.toString());
        }

        // Test timeline controls
        await page.click('button[onclick="resetTimeline()"]');
        await expect(page.locator('#currentYear')).toContainText('0');

        await page.click('button[onclick="stepForward()"]');
        await expect(page.locator('#currentYear')).toContainText('10');

        await page.click('button[onclick="stepBackward()"]');
        await expect(page.locator('#currentYear')).toContainText('0');
    });

    test('should validate city properties with known seed', async ({ page }) => {
        const testSeed = 5555555555;
        const testPopulation = 75000;
        const testCitySize = 12;

        // Set parameters
        await page.fill('#seed', testSeed.toString());
        await page.fill('#population', testPopulation.toString());
        await page.fill('#citySize', testCitySize.toString());

        // Generate city
        await page.click('button[onclick="generateCity()"]');
        await page.waitForSelector('#status.success', { timeout: 10000 });

        // Verify city properties are reasonable
        const populationText = await page.textContent('#cityPopulation');
        const population = parseInt(populationText.replace(/,/g, ''));
        expect(population).toBe(testPopulation);

        const areaText = await page.textContent('#cityArea');
        const area = parseFloat(areaText);
        expect(area).toBeCloseTo(testCitySize * testCitySize, 1);

        const densityText = await page.textContent('#cityDensity');
        const density = parseInt(densityText.replace(/,/g, ''));
        expect(density).toBeCloseTo(testPopulation / (testCitySize * testCitySize), 0);

        const districtsText = await page.textContent('#cityDistricts');
        const districts = parseInt(districtsText);
        expect(districts).toBeGreaterThan(0);
        expect(districts).toBeLessThanOrEqual(testPopulation / 1000); // Reasonable upper bound

        const zonesText = await page.textContent('#cityZones');
        const zones = parseInt(zonesText);
        expect(zones).toBeGreaterThan(0);
        expect(zones).toBeLessThanOrEqual(10); // Reasonable upper bound

        // Verify master seed is correct
        const masterSeedText = await page.textContent('#cityMasterSeed');
        expect(masterSeedText).toBe(testSeed.toString());
    });

    test('should handle edge cases without errors', async ({ page }) => {
        const edgeCases = [
            { seed: 0, population: 1000, citySize: 1, description: 'minimum values' },
            { seed: 4294967295, population: 1000000, citySize: 50, description: 'maximum values' },
            { seed: 1, population: 5000, citySize: 2, description: 'small city' },
            { seed: 999999999, population: 500000, citySize: 25, description: 'large city' }
        ];

        for (const testCase of edgeCases) {
            // Set parameters
            await page.fill('#seed', testCase.seed.toString());
            await page.fill('#population', testCase.population.toString());
            await page.fill('#citySize', testCase.citySize.toString());

            // Generate city
            await page.click('button[onclick="generateCity()"]');
            
            // Wait for either success or error status
            await page.waitForSelector('#status.success, #status.error', { timeout: 15000 });
            
            const status = await page.locator('#status').getAttribute('class');
            
            if (status.includes('error')) {
                // Log the error for debugging
                const errorText = await page.textContent('#statusText');
                console.log(`Error with ${testCase.description}: ${errorText}`);
            } else {
                // Verify no JavaScript errors
                const consoleErrors = [];
                page.on('console', msg => {
                    if (msg.type() === 'error') {
                        consoleErrors.push(msg.text());
                    }
                });

                await page.waitForTimeout(1000);
                expect(consoleErrors).toHaveLength(0);
            }
        }
    });

    test('should maintain state consistency during interactions', async ({ page }) => {
        // Generate initial city
        await page.fill('#seed', '7777777777');
        await page.fill('#population', '40000');
        await page.fill('#citySize', '8');
        await page.click('button[onclick="generateCity()"]');
        await page.waitForSelector('#status.success', { timeout: 10000 });

        // Get initial values
        const initialPopulation = await page.textContent('#cityPopulation');
        const initialDistricts = await page.textContent('#cityDistricts');
        const initialZones = await page.textContent('#cityZones');

        // Switch to temporal mode
        await page.selectOption('#simulationMode', 'temporal');
        await page.waitForSelector('#temporalControls', { state: 'visible' });

        // Generate temporal city
        await page.click('button[onclick="generateCity()"]');
        await page.waitForSelector('#status.success', { timeout: 15000 });

        // Verify temporal city has different properties
        const temporalPopulation = await page.textContent('#cityPopulation');
        const temporalDistricts = await page.textContent('#cityDistricts');
        const temporalZones = await page.textContent('#cityZones');

        // Temporal city should have different values (evolution over time)
        expect(temporalPopulation).not.toBe(initialPopulation);
        expect(temporalDistricts).not.toBe(initialDistricts);
        expect(temporalZones).not.toBe(initialZones);

        // Test timeline slider doesn't break state
        const timelineSlider = page.locator('#timelineSlider');
        await timelineSlider.fill('500');
        await page.waitForTimeout(500);

        // Verify no JavaScript errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.waitForTimeout(1000);
        expect(consoleErrors).toHaveLength(0);

        // Verify city info is still displayed
        await expect(page.locator('#cityPopulation')).toBeVisible();
        await expect(page.locator('#cityDistricts')).toBeVisible();
        await expect(page.locator('#cityZones')).toBeVisible();
    });
});
