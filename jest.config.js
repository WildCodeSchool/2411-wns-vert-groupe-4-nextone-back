/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      diagnostics: true,
      useESM: true
    },
  },
  transformIgnorePatterns: [
    "/node_modules/(?!jose)/" 
  ],
  transform: {
    "^.+\.tsx?$": ["ts-jest", {}],
    "^.+\.js$": "babel-jest",
  },

  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};