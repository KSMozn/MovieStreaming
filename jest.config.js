/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // "server-only" throws outside React Server Components; tests exercise
    // server modules directly, so stub it.
    "^server-only$": "<rootDir>/src/__tests__/mocks/server-only.js"
  },
  testMatch: ["**/__tests__/**/*.test.ts"]
};
