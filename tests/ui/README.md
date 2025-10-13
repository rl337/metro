# Metro Webapp UI Tests

This directory contains Playwright-based UI tests for the Metro City Generator webapp.

## Overview

The tests cover:
- **Basic Functionality**: Page loading, form controls, button interactions
- **City Generation**: Static and temporal city generation
- **Visual Rendering**: Canvas rendering, legend display, responsive design
- **Interactive Features**: Timeline slider, play/pause evolution, parameter changes

## Test Structure

- `test_webapp_basic.spec.js` - Basic page loading and UI element tests
- `test_webapp_functionality.spec.js` - Core functionality tests
- `test_webapp_visual.spec.js` - Visual rendering and responsive design tests

## Running Tests

### Prerequisites

1. Install Node.js (version 18 or later)
2. Install dependencies: `npm install`
3. Install Playwright browsers: `npx playwright install`

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Show test report
npm run show-report
```

### Test Configuration

Tests are configured in `playwright.config.js`:
- **Base URL**: `http://localhost:8000` (served by Python HTTP server)
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Screenshots**: Taken on failure and for visual verification
- **Videos**: Recorded on failure for debugging

## Visual Testing

The tests include visual verification by:
1. Taking screenshots at key points
2. Verifying canvas rendering
3. Testing responsive design across different viewport sizes
4. Comparing different city generations

Screenshots are saved to `tests/ui/screenshots/` for manual inspection.

## CI Integration

UI tests are automatically run in GitHub Actions:
- Installed as part of the validation pipeline
- Run on all pull requests
- Screenshots and videos uploaded as artifacts on failure

## Debugging

### Local Debugging

1. Start the webapp: `python -m http.server 8000 --directory docs`
2. Run tests in debug mode: `npm run test:debug`
3. Use Playwright Inspector to step through tests

### Common Issues

1. **Canvas not rendering**: Check that JavaScript is enabled and no console errors
2. **Tests timing out**: Increase timeout in test configuration
3. **Screenshots not matching**: Check for dynamic content or timing issues

## Adding New Tests

1. Create new test file: `test_new_feature.spec.js`
2. Follow existing patterns for page interactions
3. Add visual verification where appropriate
4. Update this README if adding new test categories

## Test Data

Tests use the default `city.json` configuration and generate cities with various parameters to ensure robustness.

