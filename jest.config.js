/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(jose)/)"
  ],
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      diagnostics: true,
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
};
