module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1.js', // Add .js extension here
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(your-module-to-transform)/)'
  ]
};