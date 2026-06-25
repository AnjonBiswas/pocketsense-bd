const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig = {
  clearMocks: true,
  collectCoverageFrom: [
    "app/api/expenses/route.ts",
    "components/dashboard/DailyBudgetCard.tsx",
    "components/modals/AddExpenseModal.tsx",
    "contexts/LanguageContext.tsx",
    "contexts/ThemeContext.tsx",
    "lib/test-utils.tsx",
    "lib/utils/budget.ts",
    "lib/utils/splitCalculator.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["<rootDir>/e2e/"]
};

module.exports = createJestConfig(customJestConfig);
