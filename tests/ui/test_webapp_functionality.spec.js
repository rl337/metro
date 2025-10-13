// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Metro Webapp Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should generate a city when Generate City button is clicked', async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Click generate city button
    await page.click('button:has-text("Generate City")');
    
    // Wait for city generation to complete
    await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
    
    // Check that status shows success
    const statusText = await page.locator('#statusText').textContent();
    expect(statusText).toContain('successfully');
    
    // Check that city info is populated
    const population = await page.locator('#cityPopulation').textContent();
    expect(population).not.toBe('N/A');
    expect(population).toMatch(/\d+/);
  });

  test('should load default city when Load Default City button is clicked', async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Click load default city button
    await page.click('button:has-text("Load Default City")');
    
    // Wait for city generation to complete
    await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
    
    // Check that status shows success
    const statusText = await page.locator('#statusText').textContent();
    expect(statusText).toContain('successfully');
  });

  test('should generate temporal city when temporal mode is selected', async ({ page }) => {
    // Select temporal mode
    await page.selectOption('#simulationMode', 'temporal');
    
    // Wait for temporal city generation
    await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });
    
    // Check that status shows temporal city generated
    const statusText = await page.locator('#statusText').textContent();
    expect(statusText).toContain('Temporal city generated');
    
    // Check that timeline slider is functional
    const timelineSlider = page.locator('#timelineSlider');
    await expect(timelineSlider).toBeVisible();
    
    // Check that current year is displayed
    const currentYear = await page.locator('#currentYear').textContent();
    expect(currentYear).toBe('0');
  });

  test('should update city when parameters are changed', async ({ page }) => {
    // Change population
    await page.fill('#population', '50000');
    
    // Change seed
    await page.fill('#seed', '1234567890');
    
    // Change city size
    await page.fill('#citySize', '15');
    
    // Generate city
    await page.click('button:has-text("Generate City")');
    
    // Wait for generation to complete
    await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
    
    // Check that the new values are reflected
    const population = await page.locator('#cityPopulation').textContent();
    expect(population).toContain('50,000');
    
    const masterSeed = await page.locator('#cityMasterSeed').textContent();
    expect(masterSeed).toBe('1234567890');
  });

  test('should show legend with all required symbols', async ({ page }) => {
    // Generate a city first
    await page.click('button:has-text("Generate City")');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
    
    // Check that legend is visible
    const legend = page.locator('text=City Legend');
    await expect(legend).toBeVisible();
    
    // Check for key legend items
    await expect(page.locator('text=Commercial Zone')).toBeVisible();
    await expect(page.locator('text=Residential Zone')).toBeVisible();
    await expect(page.locator('text=Industrial Zone')).toBeVisible();
    await expect(page.locator('text=Mixed Use Zone')).toBeVisible();
    await expect(page.locator('text=Roads & Streets')).toBeVisible();
    await expect(page.locator('text=Hospital')).toBeVisible();
    await expect(page.locator('text=School')).toBeVisible();
  });

  test('should handle timeline slider in temporal mode', async ({ page }) => {
    // Select temporal mode
    await page.selectOption('#simulationMode', 'temporal');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });
    
    // Get timeline slider
    const timelineSlider = page.locator('#timelineSlider');
    await expect(timelineSlider).toBeVisible();
    
    // Move slider to a different year
    await timelineSlider.fill('500');
    
    // Check that current year is updated
    const currentYear = await page.locator('#currentYear').textContent();
    expect(currentYear).toBe('500');
    
    // Check that city info is updated
    const population = await page.locator('#cityPopulation').textContent();
    expect(population).not.toBe('N/A');
  });

  test('should handle play/pause evolution', async ({ page }) => {
    // Select temporal mode
    await page.selectOption('#simulationMode', 'temporal');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });
    
    // Click play evolution
    await page.click('button:has-text("Play Evolution")');
    
    // Check that button text changes to "Stop Evolution"
    await expect(page.locator('button:has-text("Stop Evolution")')).toBeVisible();
    
    // Wait a bit for evolution to progress
    await page.waitForTimeout(1000);
    
    // Click stop evolution
    await page.click('button:has-text("Stop Evolution")');
    
    // Check that button text changes back to "Play Evolution"
    await expect(page.locator('button:has-text("Play Evolution")')).toBeVisible();
  });

  test('should export city data', async ({ page }) => {
    // Generate a city first
    await page.click('button:has-text("Generate City")');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
    
    // Set up download promise
    const downloadPromise = page.waitForEvent('download');
    
    // Click export city button
    await page.click('button:has-text("Export City")');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Check that download has correct filename
    expect(download.suggestedFilename()).toBe('city.json');
  });
});
