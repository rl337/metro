# Project Instruction

## Use of Docker

**MANDATORY: All development work MUST be performed in a Docker container.** 

For isolating command line dependencies and execution of commands you will use a Docker container. If one does not yet exist, create a Dockerfile and as dependencies or command line tools / libraries are needed add them to the docker container. 

**All execution of local commands should happen in the Docker container where the project directory is shared as a volume.** This includes:
- Running tests (unit tests, integration tests, UI tests)
- Running validation scripts (run_checks.sh)
- Running development servers
- Installing dependencies
- Any command-line operations

**Do NOT run tests or development commands directly on the host system.** Use the Docker container for all development activities to ensure consistency with the CI/CD environment.

## Testing and Coverage

When adding or removing code it is essential that every functional edit to the codebase have corresponding tests. These tests, when possible should use the testing frameworks of the platform, for example in python it should be pytest.  

## Validation Script

There should be a run_checks.sh that runs all automated tests, static checks, style linting, test coverage or automation that run in the github actions.  If the repository contains multiple languages or platforms ALL of their checks must be run from this validation script.

## Validation of PRs
There should be at least 1 github action designed to validate Pull Requests which run a relevant subset of 
checks found in run_checks.sh.  Ideally it will be all but there may be checks that cannot run headlessly or in a github actions context.  

# Task Instruction
All work and changes to the repository should be part of a task.  A task has a distinct starting point and measurable end goal.  If you feel like you are not presently in a task, ask for more detailed instructions or clarity on any underdeveloped parts of the problem.  Once the problem is well understood and appropriately broken down it will be tracked in a Github Issue.

When Starting a distinct task that has a clear starting point and end goal, create an Issue in the github issue tracker via the github MCP (configured via Cursor MCPs) and start a branch named after a 5 digit issue's ID left padded with 0s and suffixed with a snake case identifier transformation of the issue title.  You should check into this branch often and check github action statuses on your checkins fixing any problems that arise with them.  When the task is complete, create a PR against main for me to review and merge.

Issue tracking should take the place of status markdowns in the repository.

# Automatic Task Instructions
Once a task is started and a Github Issue is created the following steps in the task should be performed
## Starting Steps
1. Create branch as described in Task Instruction
2. Evaluate existing checks in run_checks.sh and augment them as well as checks in github actions, updating them when they are out of date or superceded by other methodology.
3. If checks introduced in step 2 of starting steps fail, those failures become part of the scope of this task.
## Closing Steps
1. Verify changes are logically complete and consistent with the overall style of the project
2. Run all checks defined in the run_checks.sh
3. Clean up any artifacts that might have been created during development of the task.  Add relevant entries to .gitignore. Fix problems found with step 2.  If there were problems fixed, return to step 1.  
4. Check in all relevant changes and new files into the branch.  Push changes to to remote.
5. **Create a pull request against main that references the GitHub issue using "Closes #<issue_number>" in the PR title or description.**
6. Wait for verification github action to complete.  If the action fails, analyze failure treating that failure like a local test failure and return to step 3.
7. When previous closing steps are complete, update the GitHub issue with what was accomplished.

# Debugging Guide

This section provides comprehensive debugging information for common issues in the Metro project.

## Common Issues and Solutions

### 1. JavaScript Errors in Web Interface

**Problem**: JavaScript errors in the browser console, especially related to data structure handling.

**Symptoms**:
- `infrastructure.services.forEach is not a function`
- `Cannot read properties of undefined`
- `TypeError: services.forEach is not a function`

**Debugging Steps**:
1. **Check Browser Console**: Open Developer Tools (F12) and look for JavaScript errors
2. **Run JavaScript Unit Tests**: `npm run test:js` - these tests specifically catch data structure issues
3. **Check Data Structure**: Verify that API responses match expected format
4. **Test Fallback Mode**: The web interface has client-side fallback when backend API is unavailable

**Solutions**:
- Ensure all rendering functions handle both array and object data formats
- Add null/undefined checks before calling array methods
- Use the data structure validation tests to prevent regressions

### 2. API Endpoint Issues (405 Method Not Allowed)

**Problem**: Web interface shows 405 errors when trying to call backend API.

**Symptoms**:
- `HTTP error! status: 405` in browser console
- City generation fails with API errors
- "Backend API not available" warning messages

**Debugging Steps**:
1. **Check Hosting Type**: Determine if site is hosted on static hosting (GitHub Pages) or dynamic hosting
2. **Test API Endpoint**: `curl -I -X POST https://your-site.com/api/simulate-city`
3. **Check Fallback**: Verify client-side generation works when API is unavailable

**Solutions**:
- For static hosting: Ensure client-side fallback is working
- For dynamic hosting: Check that Flask server is running and accessible
- Update deployment configuration to support backend APIs if needed

### 3. Python Backend Issues

**Problem**: Flask server errors or missing dependencies.

**Symptoms**:
- `ModuleNotFoundError: No module named 'flask'`
- Server fails to start
- API endpoints return 500 errors

**Debugging Steps**:
1. **Check Virtual Environment**: Ensure you're using the project's virtual environment
2. **Install Dependencies**: `pip install -e ".[dev,test]"`
3. **Check Server Logs**: Look for error messages in Flask output
4. **Test API Locally**: `curl -X POST http://localhost:5000/api/simulate-city`

**Solutions**:
- Create and activate virtual environment: `python3 -m venv venv && source venv/bin/activate`
- Install all dependencies: `pip install -e ".[dev,test]"`
- Check Python version compatibility (requires Python 3.8+)

### 4. Test Failures

**Problem**: Tests failing during development or CI/CD.

**Symptoms**:
- Unit tests fail with specific error messages
- Integration tests timeout or fail
- Coverage reports show missing coverage

**Debugging Steps**:
1. **Run Tests Locally**: `./run_checks.sh` to see all test results
2. **Check Specific Test Types**:
   - Python tests: `python -m pytest tests/ -v`
   - JavaScript tests: `npm run test:js`
   - UI tests: `npm run test:ui`
3. **Check Test Environment**: Ensure all dependencies are installed
4. **Review Test Logs**: Look for specific error messages and stack traces

**Solutions**:
- Fix failing tests before committing
- Add missing test cases for new functionality
- Update test data when APIs change
- Ensure test environment matches production

### 5. Docker Container Issues

**Problem**: Commands fail when run in Docker container.

**Symptoms**:
- `docker build` fails
- Container commands timeout
- Permission errors in container

**Debugging Steps**:
1. **Check Dockerfile**: Ensure all dependencies are properly installed
2. **Test Container Build**: `docker build -t metro-test .`
3. **Run Container Interactively**: `docker run -it metro-test /bin/bash`
4. **Check Volume Mounts**: Ensure project directory is properly mounted

**Solutions**:
- Update Dockerfile with missing dependencies
- Fix permission issues in container
- Ensure proper volume mounting for development

## Debugging Tools and Commands

### Essential Commands
```bash
# Run all validation checks
./run_checks.sh

# Run specific test suites
python -m pytest tests/ -v                    # Python tests
npm run test:js                               # JavaScript unit tests
npm run test:ui                               # UI tests
npm run test:live                             # Live site tests

# Start development server
python run_webapp.py                          # Flask backend
# Open browser to http://localhost:5000

# Docker debugging
docker build -t metro-test .
docker run -it metro-test /bin/bash
```

### Browser Debugging
1. **Developer Tools**: F12 to open browser dev tools
2. **Console Tab**: Check for JavaScript errors
3. **Network Tab**: Monitor API calls and responses
4. **Sources Tab**: Set breakpoints in JavaScript code

### Log Analysis
- **Flask Logs**: Check terminal output when running `python run_webapp.py`
- **Test Logs**: Review test output for specific failure messages
- **CI/CD Logs**: Check GitHub Actions logs for build failures

## Prevention Strategies

### 1. Comprehensive Testing
- **Unit Tests**: Test individual functions in isolation
- **Integration Tests**: Test component interactions
- **UI Tests**: Test full user workflows
- **Live Site Tests**: Test deployed application

### 2. Data Validation
- **Input Validation**: Check all user inputs
- **API Response Validation**: Ensure consistent data formats
- **Error Handling**: Graceful degradation when things fail

### 3. Monitoring and Logging
- **Console Logging**: Use `console.log()` for debugging
- **Error Tracking**: Implement proper error handling
- **Performance Monitoring**: Track loading times and errors

### 4. Documentation
- **Code Comments**: Explain complex logic
- **API Documentation**: Document all endpoints
- **Troubleshooting Guides**: This debugging guide

## Getting Help

If you encounter issues not covered in this guide:

1. **Check Recent Changes**: Look at recent commits for breaking changes
2. **Review Issues**: Check GitHub issues for similar problems
3. **Test in Isolation**: Create minimal test cases to isolate the problem
4. **Check Dependencies**: Ensure all required packages are installed
5. **Verify Environment**: Make sure development environment matches requirements

Remember: The goal is to create a robust, maintainable system that gracefully handles errors and provides clear feedback when things go wrong.

