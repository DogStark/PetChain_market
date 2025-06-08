module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/main.ts',
    '!src/**/*.module.{ts,js}',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@utils/(.*)': '<rootDir>/utils/$1',
    '@factories/(.*)': '<rootDir>/factories/$1',
    '@auth/(.*)': '<rootDir>/auth/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
};