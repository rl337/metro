module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/js/**/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/', '/tests/ui/'],
    collectCoverageFrom: [
        'docs/metro-web.js'
    ],
    coverageDirectory: 'coverage-js',
    coverageReporters: ['text', 'lcov', 'html']
};
