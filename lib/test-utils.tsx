"use client";

import { createContext, useContext } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

type TestAuthUser = {
  id: string;
  phone: string;
  name?: string | null;
};

type TestAuthContextValue = {
  user: TestAuthUser | null;
  isAuthenticated: boolean;
};

const defaultAuthUser: TestAuthUser = {
  id: "user-1",
  phone: "+8801711000000",
  name: "Test User"
};

const TestAuthContext = createContext<TestAuthContextValue | undefined>(undefined);

export function TestAuthProvider({
  children,
  user = defaultAuthUser
}: {
  children: ReactNode;
  user?: TestAuthUser | null;
}) {
  return (
    <TestAuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </TestAuthContext.Provider>
  );
}

export function useTestAuth() {
  const context = useContext(TestAuthContext);

  if (!context) {
    throw new Error("useTestAuth must be used within a TestAuthProvider");
  }

  return context;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    language = "bn",
    user = defaultAuthUser,
    ...options
  }: RenderOptions & {
    language?: "bn" | "en";
    user?: TestAuthUser | null;
  } = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider>
        <LanguageProvider initialLanguage={language}>
          <TestAuthProvider user={user}>{children}</TestAuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export function createMockExpense(overrides: Partial<{
  id: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
}> = {}) {
  return {
    id: "expense-1",
    amount: 120,
    category: "food",
    note: "Lunch",
    date: "2026-06-10",
    created_at: "2026-06-10T12:00:00.000Z",
    ...overrides
  };
}

export function createMockIncome(overrides: Partial<{
  id: string;
  amount: number;
  source: string;
  note: string | null;
  date: string;
}> = {}) {
  return {
    id: "income-1",
    amount: 5000,
    source: "allowance",
    note: "Monthly allowance",
    date: "2026-06-01",
    ...overrides
  };
}

export function createMockBudget(overrides: Partial<{
  monthly_limit: number;
  savings_goal: number;
  emergency_reserve: number;
}> = {}) {
  return {
    monthly_limit: 12000,
    savings_goal: 3000,
    emergency_reserve: 1500,
    ...overrides
  };
}
