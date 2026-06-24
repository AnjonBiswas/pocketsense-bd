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
  dailyBudget: number;
  remainingBudget: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  alerts: Array<{
    type: "warning" | "info" | "success";
    message: string;
  }>;
};

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const headerStore = headers();
  const host = headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const protocol = forwardedProto || (process.env.NODE_ENV === "development" ? "http" : "https");

  if (!host) {
    throw new Error("Unable to resolve dashboard stats host.");
  }

  const response = await fetch(`${protocol}://${host}/api/dashboard/stats`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load dashboard stats.");
  }

  return response.json();
});
