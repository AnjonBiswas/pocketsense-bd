import { eachDayOfInterval, format, subDays } from "date-fns";
import type { Expense } from "@/store/expenseStore";
import type { ChallengeDefinition } from "@/data/challenges";

export type ChallengeProgressResult = {
  progress: number;
  completed: boolean;
};

function countConsecutiveDaysWithoutCategory(expenses: Expense[], category: string, target: number) {
  const today = new Date();
  let streak = 0;

  for (let offset = 0; offset < target * 2; offset += 1) {
    const day = subDays(today, offset);
    const dayKey = format(day, "yyyy-MM-dd");
    const hasCategoryExpense = expenses.some(
      (expense) => expense.date === dayKey && expense.category === category
    );

    if (!hasCategoryExpense) {
      streak += 1;
      if (streak >= target) return streak;
    } else {
      streak = 0;
    }
  }

  return streak;
}

export function checkChallengeProgress(
  challenge: ChallengeDefinition,
  userExpenses: Expense[],
  currentDailyBudget = Number.POSITIVE_INFINITY
): ChallengeProgressResult {
  if (challenge.id === "canteen_fast") {
    const progress = countConsecutiveDaysWithoutCategory(userExpenses, "food", challenge.target);
    return { progress: Math.min(progress, challenge.target), completed: progress >= challenge.target };
  }

  if (challenge.id === "walking_warrior") {
    const transportAvoidDays = countConsecutiveDaysWithoutCategory(userExpenses, "transport", challenge.target);
    return { progress: Math.min(transportAvoidDays, challenge.target), completed: transportAvoidDays >= challenge.target };
  }

  if (challenge.id === "cigarette_crusher") {
    const progress = countConsecutiveDaysWithoutCategory(userExpenses, "cigarettes", challenge.target);
    return { progress: Math.min(progress, challenge.target), completed: progress >= challenge.target };
  }

  if (challenge.id === "budget_king") {
    const today = new Date();
    const interval = eachDayOfInterval({
      start: subDays(today, challenge.target - 1),
      end: today
    });
    const progress = interval.reduce((sum, day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      const spent = userExpenses
        .filter((expense) => expense.date === dayKey)
        .reduce((total, expense) => total + expense.amount, 0);
      return sum + (spent <= currentDailyBudget ? 1 : 0);
    }, 0);
    return { progress: Math.min(progress, challenge.target), completed: progress >= challenge.target };
  }

  if (challenge.id === "treat_smart") {
    const progress = userExpenses.filter((expense) => (expense.note || "").toLowerCase().includes("cheaper alternative")).length;
    return { progress: Math.min(progress, challenge.target), completed: progress >= challenge.target };
  }

  const genericCount = userExpenses.filter((expense) => expense.category === challenge.category).length;
  return {
    progress: Math.min(genericCount, challenge.target),
    completed: genericCount >= challenge.target
  };
}
