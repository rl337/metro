# Metro Webapp UI Testing Guide

This guide provides comprehensive information about testing the Metro City Generator webapp using Playwright.

## 🎯 Test Overview

The UI test suite covers all aspects of the webapp functionality:

- **Basic Functionality**: Page loading, form controls, button interactions
- **City Generation**: Static and temporal city generation with various parameters
- **Visual Rendering**: Canvas content, legend display, responsive design
- **Interactive Features**: Timeline slider, play/pause, parameter changes
- **Performance**: Large city generation, animation smoothness, memory usage
- **Accessibility**: Keyboard navigation, screen reader support, color contrast
- **Error Handling**: Invalid inputs, network failures, edge cases

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+**: Required for Playwright
2. **Python 3.8+**: Required for the webapp
3. **Modern Browser**: Chrome, Firefox, or Safari

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Make test runner executable
chmod +x run_ui_tests.sh
```

### Running Tests

```bash
# Run all tests
./run_ui_tests.sh

# Run specific test categories
./run_ui_tests.sh --mode basic
./run_ui_tests.sh --mode functionality
./run_ui_tests.sh --mode visual
./run_ui_tests.sh --mode performance
./run_ui_tests.sh --mode accessibility
./run_ui_tests.sh --mode errors

# Run in different browsers
./run_ui_tests.sh --browser chromium
./run_ui_tests.sh --browser firefox
./run_ui_tests.sh --browser webkit

# Run in headed mode (see browser)
./run_ui_tests.sh --headed

# Run in debug mode
./run_ui_tests.sh --debug

# Show test report after completion
./run_ui_tests.sh --report
```

## 📋 Test Categories

### 1. Basic Functionality Tests (`test_webapp_basic.spec.js`)

Tests fundamental webapp functionality:

- ✅ Page loading and element presence
- ✅ Form validation and input handling
- ✅ Button functionality and state changes
- ✅ Canvas element rendering
- ✅ City information display
- ✅ Temporal controls visibility

**Key Test Scenarios:**
- Page loads with all required elements
- Form controls accept valid inputs
- Buttons trigger appropriate actions
- Canvas renders with proper dimensions
- City info updates after generation

### 2. Functionality Tests (`test_webapp_functionality.spec.js`)

Tests core webapp features:

- ✅ City generation with various parameters
- ✅ Temporal evolution features
- ✅ Parameter changes and persistence
- ✅ Export/import functionality
- ✅ Timeline slider operation
- ✅ Play/pause animation

**Key Test Scenarios:**
- Generate city with default parameters
- Load default city from JSON
- Switch between static and temporal modes
- Change parameters and regenerate city
- Export city data as JSON
- Navigate timeline in temporal mode

### 3. Visual Tests (`test_webapp_visual.spec.js`)

Tests visual rendering and responsive design:

- ✅ Canvas rendering with districts and roads
- ✅ Legend display and positioning
- ✅ Responsive design across viewport sizes
- ✅ Cross-browser visual consistency
- ✅ Screenshot comparison for regression testing

**Key Test Scenarios:**
- Different seeds produce different city layouts
- Canvas renders districts with correct colors
- Legend displays all symbols correctly
- Responsive design works on mobile/tablet
- Visual elements scale properly

### 4. Performance Tests (`test_webapp_performance.spec.js`)

Tests performance with large datasets:

- ✅ Large city generation (1M population)
- ✅ Timeline animation smoothness
- ✅ Memory usage during long sessions
- ✅ Canvas rendering efficiency
- ✅ Concurrent operations handling

**Key Test Scenarios:**
- Generate city with 1M population within 10 seconds
- Maintain 60fps during timeline animation
- Handle rapid parameter changes without lag
- Memory usage remains stable during long sessions
- Canvas re-renders efficiently

### 5. Accessibility Tests (`test_webapp_accessibility.spec.js`)

Tests accessibility compliance:

- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ ARIA labels and roles
- ✅ Color contrast validation
- ✅ Focus management
- ✅ High contrast mode support

**Key Test Scenarios:**
- All interactive elements are keyboard accessible
- Form controls have proper labels
- Focus indicators are visible
- Color contrast meets WCAG standards
- Works with screen readers

### 6. Error Handling Tests (`test_webapp_errors.spec.js`)

Tests error scenarios and edge cases:

- ✅ Invalid input handling
- ✅ Network failure scenarios
- ✅ Browser compatibility issues
- ✅ Rapid user actions
- ✅ Memory pressure handling

**Key Test Scenarios:**
- Invalid population/seed/size values are rejected
- Network failures are handled gracefully
- Rapid button clicking doesn't crash app
- Mode switching during generation works
- Concurrent operations are handled safely

## 🔧 Configuration

### Playwright Configuration (`playwright.config.js`)

```javascript
module.exports = defineConfig({
  testDir: './tests/ui',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'python -m http.server 8000 --directory docs',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Runner Configuration (`run_ui_tests.sh`)

The test runner supports various options:

- `--mode`: Test category (basic, functionality, visual, performance, accessibility, errors, all)
- `--browser`: Browser (chromium, firefox, webkit, all)
- `--headed`: Run in headed mode (show browser)
- `--debug`: Run in debug mode
- `--report`: Show test report after completion

## 📊 Test Results

### Output Locations

- **HTML Report**: `test-results/index.html`
- **Screenshots**: `test-results/screenshots/` (on failure)
- **Videos**: `test-results/videos/` (on failure)
- **Traces**: `test-results/` (for debugging)
- **Visual Screenshots**: `tests/ui/screenshots/` (for visual tests)

### Viewing Results

```bash
# Open HTML report
npx playwright show-report

# View specific test results
open test-results/index.html

# View screenshots
open test-results/screenshots/
```

## 🐛 Debugging

### Debug Mode

```bash
# Run tests in debug mode
./run_ui_tests.sh --debug

# Debug specific test
npx playwright test test_webapp_basic.spec.js --debug
```

### Common Issues

1. **Canvas not rendering**: Check JavaScript console for errors
2. **Tests timing out**: Increase timeout in configuration
3. **Screenshots not matching**: Check for dynamic content or timing issues
4. **Browser not launching**: Ensure Playwright browsers are installed

### Debugging Tips

1. **Use headed mode**: `./run_ui_tests.sh --headed` to see browser
2. **Check console logs**: Look for JavaScript errors
3. **Inspect elements**: Use browser dev tools during tests
4. **Check network**: Verify web server is running on port 8000
5. **Review traces**: Use Playwright trace viewer for step-by-step debugging

## 🔄 CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Manual workflow dispatch

### Local Development

```bash
# Run full validation (includes UI tests)
./run_checks.sh

# Run only UI tests
./run_ui_tests.sh

# Run specific test category
./run_ui_tests.sh --mode visual --headed
```

## 📈 Adding New Tests

### Test Structure

```javascript
// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('New Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should test new feature', async ({ page }) => {
    // Test implementation
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Best Practices

1. **Use descriptive test names**: Clearly describe what is being tested
2. **Group related tests**: Use `test.describe()` for organization
3. **Clean up after tests**: Use `test.beforeEach()` and `test.afterEach()`
4. **Wait for elements**: Use `page.waitForSelector()` for dynamic content
5. **Take screenshots**: For visual verification
6. **Test edge cases**: Include error scenarios and boundary conditions

### Test Categories

- **Basic**: Page loading, element presence
- **Functionality**: Core features, user interactions
- **Visual**: Rendering, responsive design
- **Performance**: Speed, memory usage
- **Accessibility**: Keyboard navigation, screen readers
- **Errors**: Error handling, edge cases

## 🎨 Visual Testing

### Screenshot Comparison

Visual tests capture screenshots for comparison:

- Different city generations with various seeds
- Responsive design across viewport sizes
- Timeline evolution at different years
- Error states and edge cases

### Screenshot Locations

- `tests/ui/screenshots/`: Visual test screenshots
- `test-results/screenshots/`: Failure screenshots
- `test-results/`: Test execution screenshots

### Updating Screenshots

When visual changes are intentional:

```bash
# Update screenshots
npx playwright test --update-snapshots

# Update specific test
npx playwright test test_webapp_visual.spec.js --update-snapshots
```

## 🚀 Performance Testing

### Metrics Tracked

- **Generation Time**: City generation speed
- **Animation FPS**: Timeline animation smoothness
- **Memory Usage**: Memory consumption during long sessions
- **Canvas Rendering**: Canvas update performance
- **Concurrent Operations**: Handling multiple simultaneous actions

### Performance Thresholds

- Large city (1M population): < 10 seconds
- Timeline animation: > 30 FPS
- Canvas re-render: < 500ms
- Memory usage: Stable over 5 iterations
- Concurrent operations: No crashes or errors

## ♿ Accessibility Testing

### WCAG Compliance

Tests verify compliance with Web Content Accessibility Guidelines:

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: Meets WCAG AA standards
- **Focus Management**: Clear focus indicators
- **Responsive Design**: Works across different viewport sizes

### Testing Tools

- **Playwright**: Automated accessibility testing
- **Browser DevTools**: Manual accessibility inspection
- **Screen Reader Simulation**: Keyboard navigation testing
- **Color Contrast Checkers**: Visual accessibility validation

## 🔧 Troubleshooting

### Common Problems

1. **Tests fail locally but pass in CI**
   - Check Node.js version compatibility
   - Verify Playwright browser installation
   - Check for environment differences

2. **Canvas rendering issues**
   - Verify JavaScript is enabled
   - Check for console errors
   - Ensure web server is running

3. **Timeline animation not smooth**
   - Check browser performance settings
   - Verify hardware acceleration
   - Test on different devices

4. **Screenshots don't match**
   - Check for dynamic content
   - Verify timing issues
   - Update screenshots if changes are intentional

### Getting Help

1. **Check logs**: Review test output and error messages
2. **Use debug mode**: Run tests with `--debug` flag
3. **Check documentation**: Review Playwright docs
4. **Create issue**: Report bugs with test output and screenshots

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Metro Project README](../README.md)
- [Test Configuration](playwright.config.js)
- [Test Runner Script](../run_ui_tests.sh)
