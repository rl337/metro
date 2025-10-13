// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Metro Webapp Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page', async ({ page }) => {
    await expect(page).toHaveTitle(/Metro City Generator/);
    await expect(page.locator('h1')).toContainText('Metro City Generator');
  });

  test('should have all required form controls', async ({ page }) => {
    // Check population input
    await expect(page.locator('#population')).toBeVisible();
    await expect(page.locator('#population')).toHaveValue('100000');

    // Check seed input
    await expect(page.locator('#seed')).toBeVisible();
    await expect(page.locator('#seed')).toHaveValue('2944957927');

    // Check city size input
    await expect(page.locator('#citySize')).toBeVisible();
    await expect(page.locator('#citySize')).toHaveValue('10');

    // Check simulation mode dropdown
    await expect(page.locator('#simulationMode')).toBeVisible();
    await expect(page.locator('#simulationMode')).toHaveValue('static');
  });

  test('should have all required buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Generate City")')).toBeVisible();
    await expect(page.locator('button:has-text("Load Default City")')).toBeVisible();
    await expect(page.locator('button:has-text("Export City")')).toBeVisible();
    await expect(page.locator('button:has-text("Play Evolution")')).toBeVisible();
  });

  test('should have canvas element', async ({ page }) => {
    const canvas = page.locator('#cityCanvas');
    await expect(canvas).toBeVisible();
    
    // Check canvas dimensions
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox.width).toBeGreaterThan(0);
    expect(canvasBox.height).toBeGreaterThan(0);
  });

  test('should have city information display', async ({ page }) => {
    await expect(page.locator('#cityPopulation')).toBeVisible();
    await expect(page.locator('#cityArea')).toBeVisible();
    await expect(page.locator('#cityDensity')).toBeVisible();
    await expect(page.locator('#cityDistricts')).toBeVisible();
    await expect(page.locator('#cityZones')).toBeVisible();
    await expect(page.locator('#cityMasterSeed')).toBeVisible();
    await expect(page.locator('#cityGeneratedAt')).toBeVisible();
  });

  test('should show temporal controls when temporal mode is selected', async ({ page }) => {
    // Initially hidden
    await expect(page.locator('#temporalControls')).toBeHidden();
    
    // Select temporal mode
    await page.selectOption('#simulationMode', 'temporal');
    
    // Should now be visible
    await expect(page.locator('#temporalControls')).toBeVisible();
    await expect(page.locator('#timelineSlider')).toBeVisible();
    await expect(page.locator('#currentYear')).toBeVisible();
  });
});
