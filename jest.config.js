module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: "ts-jest",

  // Set the test environment
  testEnvironment: "node",

  // Test file patterns
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Transform configuration
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  // Coverage configuration (optional)
  collectCoverageFrom: ["src/**/*.(ts|tsx)", "!src/**/*.d.ts"],

  // Root directories
  roots: ["<rootDir>/src"],

  // Setup files (if needed)
  setupFilesAfterEnv: [],
};
