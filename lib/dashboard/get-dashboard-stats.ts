import { cache } from "react";
import { headers } from "next/headers";

export type DashboardStats = {
  totalIncome: number;
  totalExpenses: number;
  fixedExpenses: number;
  savingsGoal: number;
  monthlyLimit: number;
  emergencyReserve: number;
  streak: number;
  monthlyRank: string;
  daysElapsed: number;
  daysInMonth: number;
  daysRemaining: number;
  spentToday: number;
  entriesToday: number;
  dailyBudget: number;
  remainingBudget: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  sos: {
    shouldActivate: boolean;
    severity: "warning" | "critical";
    isActive: boolean;
    remainingBudget: number;
    daysRemaining: number;
    dailyBudget: number;
    activatedTips: string[];
    projectedSavings: number;
    canSurvive: boolean;
    survivalTarget: number;
    hasLockedFunds: boolean;
    lockedAmount: number;
    hasPin: boolean;
    complianceScore: number;
    luxuryWarning: string | null;
  };
  alerts: Array<{
    type: "warning" | "info" | "success";
    title?: string;
    message: string;
  }>;
};

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  totalIncome: 0,
  totalExpenses: 0,
  fixedExpenses: 0,
  savingsGoal: 0,
  monthlyLimit: 0,
  emergencyReserve: 0,
  streak: 0,
  monthlyRank: "Getting Started",
  daysElapsed: 1,
  daysInMonth: 30,
  daysRemaining: 29,
  spentToday: 0,
  entriesToday: 0,
  dailyBudget: 0,
  remainingBudget: 0,
  topCategories: [],
  sos: {
    shouldActivate: false,
    severity: "warning",
    isActive: false,
    remainingBudget: 0,
    daysRemaining: 29,
    dailyBudget: 0,
    activatedTips: [],
    projectedSavings: 0,
    canSurvive: true,
    survivalTarget: 100,
    hasLockedFunds: false,
    lockedAmount: 0,
    hasPin: false,
    complianceScore: 0,
    luxuryWarning: null
  },
  alerts: []
};

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const headerStore = headers();
  const host = headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const cookie = headerStore.get("cookie") || "";
  const protocol = forwardedProto || (process.env.NODE_ENV === "development" ? "http" : "https");

  if (!host) {
    return EMPTY_DASHBOARD_STATS;
  }

  try {
    const response = await fetch(`${protocol}://${host}/api/dashboard/stats`, {
      cache: "no-store",
      headers: {
        cookie
      }
    });

    if (!response.ok) {
      return EMPTY_DASHBOARD_STATS;
    }

    return response.json();
  } catch {
    return EMPTY_DASHBOARD_STATS;
  }
});
