#!/bin/bash

# Metro Webapp UI Test Runner
# This script runs Playwright tests with various configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[HEADER]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_header "Metro Webapp UI Test Runner"
echo "=========================================="

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is required but not found"
    print_error "Please install Node.js 18 or later"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is required but not found"
    print_error "Please install npm"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or later is required, found $NODE_VERSION"
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "playwright.config.js" ]; then
    print_error "Please run this script from the Metro project root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing Playwright dependencies..."
    npm install
fi

# Install Playwright browsers if needed
if ! npx playwright --version > /dev/null 2>&1; then
    print_status "Installing Playwright browsers..."
    npx playwright install --with-deps
fi

# Parse command line arguments
TEST_MODE="all"
BROWSER="all"
HEADED=false
DEBUG=false
REPORT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --mode)
            TEST_MODE="$2"
            shift 2
            ;;
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        --headed)
            HEADED=true
            shift
            ;;
        --debug)
            DEBUG=true
            shift
            ;;
        --report)
            REPORT=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --mode MODE      Test mode: basic, functionality, visual, performance, accessibility, errors, all (default: all)"
            echo "  --browser BROWSER Browser: chromium, firefox, webkit, all (default: all)"
            echo "  --headed         Run tests in headed mode (show browser)"
            echo "  --debug          Run tests in debug mode"
            echo "  --report         Show test report after completion"
            echo "  --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Run all tests"
            echo "  $0 --mode basic --headed             # Run basic tests in headed mode"
            echo "  $0 --mode visual --browser chromium  # Run visual tests in Chrome only"
            echo "  $0 --mode performance --debug        # Run performance tests in debug mode"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Validate test mode
case $TEST_MODE in
    basic|functionality|visual|performance|accessibility|errors|all)
        ;;
    *)
        print_error "Invalid test mode: $TEST_MODE"
        print_error "Valid modes: basic, functionality, visual, performance, accessibility, errors, all"
        exit 1
        ;;
esac

# Validate browser
case $BROWSER in
    chromium|firefox|webkit|all)
        ;;
    *)
        print_error "Invalid browser: $BROWSER"
        print_error "Valid browsers: chromium, firefox, webkit, all"
        exit 1
        ;;
esac

# Build test command
TEST_CMD="npx playwright test"

if [ "$TEST_MODE" != "all" ]; then
    TEST_CMD="$TEST_CMD tests/ui/test_webapp_${TEST_MODE}.spec.js"
fi

if [ "$BROWSER" != "all" ]; then
    TEST_CMD="$TEST_CMD --project=$BROWSER"
fi

if [ "$HEADED" = true ]; then
    TEST_CMD="$TEST_CMD --headed"
fi

if [ "$DEBUG" = true ]; then
    TEST_CMD="$TEST_CMD --debug"
fi

# Add reporter
TEST_CMD="$TEST_CMD --reporter=html,line"

print_status "Test configuration:"
print_status "  Mode: $TEST_MODE"
print_status "  Browser: $BROWSER"
print_status "  Headed: $HEADED"
print_status "  Debug: $DEBUG"

echo ""
print_header "Starting UI Tests"
echo "=========================================="

# Start web server if not already running
if ! curl -s http://localhost:8000 > /dev/null 2>&1; then
    print_status "Starting web server..."
    python -m http.server 8000 --directory docs &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 3
    
    # Check if server started successfully
    if ! curl -s http://localhost:8000 > /dev/null 2>&1; then
        print_error "Failed to start web server"
        exit 1
    fi
    
    print_status "Web server started (PID: $SERVER_PID)"
else
    print_status "Web server already running"
    SERVER_PID=""
fi

# Run tests
print_status "Running tests: $TEST_CMD"
echo ""

if eval $TEST_CMD; then
    print_status "✅ All tests passed!"
    TEST_RESULT=0
else
    print_error "❌ Some tests failed!"
    TEST_RESULT=1
fi

# Clean up web server
if [ ! -z "$SERVER_PID" ]; then
    print_status "Stopping web server (PID: $SERVER_PID)..."
    kill $SERVER_PID 2>/dev/null || true
fi

# Show test report if requested
if [ "$REPORT" = true ] || [ "$TEST_RESULT" -ne 0 ]; then
    print_status "Opening test report..."
    npx playwright show-report
fi

# Show test results summary
echo ""
print_header "Test Results Summary"
echo "=========================================="

if [ -d "test-results" ]; then
    TEST_COUNT=$(find test-results -name "*.json" | wc -l)
    print_status "Test files processed: $TEST_COUNT"
    
    if [ -d "test-results/screenshots" ]; then
        SCREENSHOT_COUNT=$(find test-results/screenshots -name "*.png" | wc -l)
        print_status "Screenshots captured: $SCREENSHOT_COUNT"
    fi
    
    if [ -d "test-results/videos" ]; then
        VIDEO_COUNT=$(find test-results/videos -name "*.webm" | wc -l)
        print_status "Videos recorded: $VIDEO_COUNT"
    fi
fi

if [ -d "tests/ui/screenshots" ]; then
    SCREENSHOT_COUNT=$(find tests/ui/screenshots -name "*.png" | wc -l)
    print_status "Visual test screenshots: $SCREENSHOT_COUNT"
fi

echo ""
if [ "$TEST_RESULT" -eq 0 ]; then
    print_status "🎉 All UI tests completed successfully!"
else
    print_error "💥 Some UI tests failed. Check the test report for details."
fi

echo ""
print_status "Test artifacts saved to:"
print_status "  - test-results/ (HTML report, videos, traces)"
print_status "  - tests/ui/screenshots/ (Visual test screenshots)"

exit $TEST_RESULT

