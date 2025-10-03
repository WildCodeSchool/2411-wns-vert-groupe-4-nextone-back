/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  preset: "ts-jest",

    transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true,
    }],
    '^.+\\.js$': 'babel-jest',
  },
  
  transformIgnorePatterns: [
    "/node_modules/(?!jose)/" 
  ],

  extensionsToTreatAsEsm: ['.ts'],
};