module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**.test.js'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
}
