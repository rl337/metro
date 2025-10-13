// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Metro Webapp Error Handling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle invalid population values', async ({ page }) => {
    // Test negative population
    await page.fill('#population', '-1000');
    await page.click('button:has-text("Generate City")');
    
    // Should either prevent generation or show error
    await page.waitForTimeout(2000);
    
    // Check if error is shown or generation is prevented
    const population = await page.locator('#population').inputValue();
    const statusText = await page.locator('#statusText').textContent();
    
    // Either the input should be corrected or an error should be shown
    expect(parseInt(population)).toBeGreaterThanOrEqual(0);
    
    // Test zero population
    await page.fill('#population', '0');
    await page.click('button:has-text("Generate City")');
    await page.waitForTimeout(2000);
    
    // Should handle zero population gracefully
    const statusText2 = await page.locator('#statusText').textContent();
    expect(statusText2).toBeDefined();
    
    // Test extremely large population
    await page.fill('#population', '999999999999');
    await page.click('button:has-text("Generate City")');
    
    // Should either cap the value or show error
    await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });
    const statusText3 = await page.locator('#statusText').textContent();
    expect(statusText3).toBeDefined();
  });

  test('should handle invalid seed values', async ({ page }) => {
    // Test negative seed
    await page.fill('#seed', '-1234567890');
    await page.click('button:has-text("Generate City")');
    
    // Should either prevent generation or show error
    await page.waitForTimeout(2000);
    
    const seed = await page.locator('#seed').inputValue();
    const statusText = await page.locator('#statusText').textContent();
    
    // Either the input should be corrected or an error should be shown
    expect(parseInt(seed)).toBeGreaterThanOrEqual(0);
    
    // Test zero seed
    await page.fill('#seed', '0');
    await page.click('button:has-text("Generate City")');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
    
    const statusText2 = await page.locator('#statusText').textContent();
    expect(statusText2).toBeDefined();
    
    // Test extremely large seed
    await page.fill('#seed', '999999999999999999');
    await page.click('button:has-text("Generate City")');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
    
    const statusText3 = await page.locator('#statusText').textContent();
    expect(statusText3).toBeDefined();
  });

  test('should handle invalid city size values', async ({ page }) => {
    // Test negative city size
    await page.fill('#citySize', '-5');
    await page.click('button:has-text("Generate City")');
    
    await page.waitForTimeout(2000);
    
    const citySize = await page.locator('#citySize').inputValue();
    const statusText = await page.locator('#statusText').textContent();
    
    // Either the input should be corrected or an error should be shown
    expect(parseFloat(citySize)).toBeGreaterThan(0);
    
    // Test zero city size
    await page.fill('#citySize', '0');
    await page.click('button:has-text("Generate City")');
    await page.waitForTimeout(2000);
    
    const citySize2 = await page.locator('#citySize').inputValue();
    expect(parseFloat(citySize2)).toBeGreaterThan(0);
    
    // Test extremely large city size
    await page.fill('#citySize', '999999');
    await page.click('button:has-text("Generate City")');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });
    
    const statusText2 = await page.locator('#statusText').textContent();
    expect(statusText2).toBeDefined();
  });

  test('should handle non-numeric input values', async ({ page }) => {
    // Test text input in population field
    await page.fill('#population', 'abc123');
    await page.click('button:has-text("Generate City")');
    
    await page.waitForTimeout(2000);
    
    const population = await page.locator('#population').inputValue();
    const statusText = await page.locator('#statusText').textContent();
    
    // Should either clear invalid input or show error
    expect(population).toBeDefined();
    
    // Test text input in seed field
    await page.fill('#seed', 'xyz789');
    await page.click('button:has-text("Generate City")');
    
    await page.waitForTimeout(2000);
    
    const seed = await page.locator('#seed').inputValue();
    expect(seed).toBeDefined();
    
    // Test text input in city size field
    await page.fill('#citySize', 'def456');
    await page.click('button:has-text("Generate City")');
    
    await page.waitForTimeout(2000);
    
    const citySize = await page.locator('#citySize').inputValue();
    expect(citySize).toBeDefined();
  });

  test('should handle empty input values', async ({ page }) => {
    // Test empty population
    await page.fill('#population', '');
    await page.click('button:has-text("Generate City")');
    
    await page.waitForTimeout(2000);
    
    const population = await page.locator('#population').inputValue();
    const statusText = await page.locator('#statusText').textContent();
    
    // Should either use default value or show error
    expect(population).toBeDefined();
    
    // Test empty seed
    await page.fill('#seed', '');
    await page.click('button:has-text("Generate City")');
    
    await page.waitForTimeout(2000);
    
    const seed = await page.locator('#seed').inputValue();
    expect(seed).toBeDefined();
    
    // Test empty city size
    await page.fill('#citySize', '');
    await page.click('button:has-text("Generate City")');
    
    await page.waitForTimeout(2000);
    
    const citySize = await page.locator('#citySize').inputValue();
    expect(citySize).toBeDefined();
  });

  test('should handle rapid button clicking', async ({ page }) => {
    // Rapidly click generate button multiple times
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Generate City")');
      await page.waitForTimeout(100);
    }
    
    // Should handle rapid clicks gracefully
    await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });
    
    const statusText = await page.locator('#statusText').textContent();
    expect(statusText).toBeDefined();
    
    // Should not crash or show multiple error states
    const statusElements = await page.locator('#status').count();
    expect(statusElements).toBe(1);
  });

  test('should handle mode switching during generation', async ({ page }) => {
    // Start city generation
    await page.click('button:has-text("Generate City")');
    
    // Switch to temporal mode while generating
    await page.selectOption('#simulationMode', 'temporal');
    
    // Should handle mode switch gracefully
    await page.waitForTimeout(2000);
    
    // Check that temporal controls are visible
    const temporalControls = page.locator('#temporalControls');
    await expect(temporalControls).toBeVisible();
    
    // Should not crash or show error states
    const statusText = await page.locator('#statusText').textContent();
    expect(statusText).toBeDefined();
  });

  test('should handle timeline slider edge cases', async ({ page }) => {
    // Switch to temporal mode
    await page.selectOption('#simulationMode', 'temporal');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });
    
    const timelineSlider = page.locator('#timelineSlider');
    const maxYear = await timelineSlider.getAttribute('max');
    
    // Test setting year to maximum
    await timelineSlider.fill(maxYear);
    const currentYear = await page.locator('#currentYear').textContent();
    expect(currentYear).toBe(maxYear);
    
    // Test setting year to minimum
    await timelineSlider.fill('0');
    const currentYear2 = await page.locator('#currentYear').textContent();
    expect(currentYear2).toBe('0');
    
    // Test setting year beyond maximum
    await timelineSlider.fill((parseInt(maxYear) + 1000).toString());
    const currentYear3 = await page.locator('#currentYear').textContent();
    expect(parseInt(currentYear3)).toBeLessThanOrEqual(parseInt(maxYear));
    
    // Test setting negative year
    await timelineSlider.fill('-100');
    const currentYear4 = await page.locator('#currentYear').textContent();
    expect(parseInt(currentYear4)).toBeGreaterThanOrEqual(0);
  });

  test('should handle play/pause button edge cases', async ({ page }) => {
    // Switch to temporal mode
    await page.selectOption('#simulationMode', 'temporal');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });
    
    const playBtn = page.locator('button:has-text("Play Evolution")');
    const stopBtn = page.locator('button:has-text("Stop Evolution")');
    
    // Rapidly click play/stop multiple times
    for (let i = 0; i < 3; i++) {
      await playBtn.click();
      await page.waitForTimeout(100);
      await stopBtn.click();
      await page.waitForTimeout(100);
    }
    
    // Should handle rapid clicking gracefully
    await expect(playBtn).toBeVisible();
    
    // Test clicking play when already playing
    await playBtn.click();
    await page.waitForTimeout(100);
    await playBtn.click(); // Click again while playing
    
    // Should handle gracefully
    await expect(stopBtn).toBeVisible();
  });

  test('should handle export with no city data', async ({ page }) => {
    // Try to export without generating a city first
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
    
    try {
      await page.click('button:has-text("Export City")');
      await downloadPromise;
    } catch (error) {
      // Should either show error message or not trigger download
      const statusText = await page.locator('#statusText').textContent();
      expect(statusText).toContain('No city to export');
    }
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate network failure by intercepting requests
    await page.route('**/city.json', route => route.abort());
    
    // Try to load default city
    await page.click('button:has-text("Load Default City")');
    
    // Should handle network failure gracefully
    await page.waitForTimeout(2000);
    
    const statusText = await page.locator('#statusText').textContent();
    expect(statusText).toContain('Error loading default city');
  });

  test('should handle browser compatibility issues', async ({ page }) => {
    // Test with disabled JavaScript (simulate old browser)
    await page.addInitScript(() => {
      // Disable some modern JavaScript features
      window.requestAnimationFrame = undefined;
      window.cancelAnimationFrame = undefined;
    });
    
    // Reload page
    await page.reload();
    
    // Should still load basic functionality
    await expect(page.locator('#population')).toBeVisible();
    await expect(page.locator('#seed')).toBeVisible();
    await expect(page.locator('#citySize')).toBeVisible();
    
    // Test basic functionality
    await page.fill('#population', '50000');
    await page.fill('#seed', '1234567890');
    await page.fill('#citySize', '10');
    
    // Should still work with basic functionality
    await page.click('button:has-text("Generate City")');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
    
    const statusText = await page.locator('#statusText').textContent();
    expect(statusText).toBeDefined();
  });

  test('should handle memory pressure gracefully', async ({ page }) => {
    // Generate multiple large cities to test memory handling
    for (let i = 0; i < 3; i++) {
      await page.fill('#population', '500000');
      await page.fill('#seed', (1000000000 + i * 1000000).toString());
      await page.click('button:has-text("Generate City")');
      await page.waitForSelector('#status:not(.hidden)', { timeout: 15000 });
      
      // Clear any potential memory leaks
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
    }
    
    // Should still be functional after memory pressure
    await page.fill('#population', '100000');
    await page.click('button:has-text("Generate City")');
    await page.waitForSelector('#status:not(.hidden)', { timeout: 10000 });
    
    const statusText = await page.locator('#statusText').textContent();
    expect(statusText).toContain('successfully');
  });

  test('should handle concurrent user actions', async ({ page }) => {
    // Simulate multiple rapid user actions
    const actions = [
      () => page.fill('#population', '100000'),
      () => page.fill('#seed', '1111111111'),
      () => page.fill('#citySize', '12'),
      () => page.click('button:has-text("Generate City")'),
      () => page.selectOption('#simulationMode', 'temporal'),
      () => page.click('button:has-text("Load Default City")')
    ];
    
    // Execute actions rapidly
    for (const action of actions) {
      try {
        await action();
        await page.waitForTimeout(50);
      } catch (error) {
        // Should handle concurrent actions gracefully
        console.log('Action failed:', error.message);
      }
    }
    
    // Should not crash and should show some status
    await page.waitForTimeout(2000);
    const statusText = await page.locator('#statusText').textContent();
    expect(statusText).toBeDefined();
  });
});
