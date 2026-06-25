import { format, subDays } from "date-fns";
import type { Expense } from "@/store/expenseStore";

export type StreakSummary = {
  currentStreak: number;
  longestStreak: number;
  rewardXp: number;
  rewardBadge: string | null;
};

export function calculateBudgetStreak(
  expenses: Expense[],
  dailyBudgetByDate: Record<string, number>,
  baselineLongestStreak = 0
): StreakSummary {
  let currentStreak = 0;
  let scanning = true;

  for (let offset = 0; offset < 60 && scanning; offset += 1) {
    const day = subDays(new Date(), offset);
    const dayKey = format(day, "yyyy-MM-dd");
    const spent = expenses
      .filter((expense) => expense.date === dayKey)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const budget = dailyBudgetByDate[dayKey] ?? Number.POSITIVE_INFINITY;

    if (spent <= budget) {
      currentStreak += 1;
    } else {
      scanning = false;
    }
  }

  const longestStreak = Math.max(baselineLongestStreak, currentStreak);
  let rewardXp = 0;
  let rewardBadge: string | null = null;

  if (currentStreak >= 30) {
    rewardXp = 1000;
    rewardBadge = "streak-legend";
  } else if (currentStreak >= 7) {
    rewardXp = 200;
    rewardBadge = null;
  }

  return {
    currentStreak,
    longestStreak,
    rewardXp,
    rewardBadge
  };
}

