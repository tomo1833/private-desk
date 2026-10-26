const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const apiJestConfig = {
  displayName: 'API Tests',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/api/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/app/api/**/*.ts',
    'src/lib/**/*.ts',
    '!src/**/*.d.ts',
  ],
};

module.exports = createJestConfig(apiJestConfig);