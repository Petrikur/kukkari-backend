
module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  globalSetup: './tests/setup.js',
  globalTeardown: './tests/teardown.js',
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  coverageProvider: "v8",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  // testPathIgnorePatterns: ["./tests/users.test.js"]
};
