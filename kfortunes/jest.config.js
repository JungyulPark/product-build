module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.min.js',
    '!js/gpt-fortune.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
