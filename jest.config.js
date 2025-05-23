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
    },
  },
  transformIgnorePatterns: [
  "/node_modules/(?!jose)/"  // ← autorise la transformation de jose
],
transform: {
    "^.+\.tsx?$": ["ts-jest", {}],
    "^.+\.js$": "babel-jest",
  },
};