module.exports = {
  testEnvironment: 'node',
  // verbose: true,
  testURL: 'http://localhost/',
  testMatch: ['**/__tests__/**.test.js'],
  projects: [
    {
      displayName: 'models',
      testMatch: ['server/**/__tests__/**.test.js'],
    },
  ],
}
