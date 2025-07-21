const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  displayName: 'Component Tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '<rootDir>/tests/components/**/*.test.{ts,tsx}',
    '<rootDir>/tests/styles/**/*.test.{ts,tsx}',
    '<rootDir>/tests/accessibility/**/*.test.{ts,tsx}'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/tests/api/'],
  collectCoverageFrom: [
    'src/app/components/**/*.{ts,tsx}',
    'src/app/layout.tsx',
    'src/app/(main)/page.tsx',
    '!src/**/*.d.ts',
  ],
};

module.exports = createJestConfig(customJestConfig);
