/** @type {import('jest').Config} */
const config = {
    verbose: true,
    testPathIgnorePatterns: ['node_modules', 'multiple-run.test', 'wpt-tests'],
};

module.exports = config;
