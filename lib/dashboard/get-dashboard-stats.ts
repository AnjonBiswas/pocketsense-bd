import { cache } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { createServerComponentClient } from "@/lib/supabase/server";
import { getSOSState } from "@/lib/sos/get-sos-state";
import { generateAlerts } from "@/lib/utils/alerts";
import type { DebtRecord, ReminderRecord } from "@/lib/utils/alerts";
import { calculateDailyBudget } from "@/lib/utils/budget";
import { getCategoryMeta } from "@/lib/utils/categories";

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
    periodKey?: string;
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

async function fetchOptionalRows(
  supabase: ReturnType<typeof createServerComponentClient>,
  table: "reminders" | "debts",
  userId: string
) {
  const selection =
    table === "reminders"
      ? "id, user_id, kind, title, note, due_date, amount, status, created_at"
      : "id, user_id, friend_name, amount, direction, due_date, note, status, created_at";

  const { data } = await supabase.from(table).select(selection).eq("user_id", userId);
  return data || [];
}

function buildCategoryTotals(expenses: Array<{ category: string; amount: number }>, totalExpenses: number) {
  return Object.entries(
    expenses.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.category] = (accumulator[item.category] || 0) + item.amount;
      return accumulator;
    }, {})
  )
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: getCategoryMeta(category).color
    }))
    .sort((left, right) => right.amount - left.amount);
}

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  try {
    const supabase = createServerComponentClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return EMPTY_DASHBOARD_STATS;
    }

    const today = new Date();
    const monthStart = startOfMonth(today).toISOString().slice(0, 10);
    const monthEnd = endOfMonth(today).toISOString().slice(0, 10);
    const reminderStart = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1)).toISOString().slice(0, 10);
    const daysInMonth = endOfMonth(today).getDate();
    const daysElapsed = today.getDate();
    const daysRemaining = Math.max(daysInMonth - daysElapsed, 1);
    const todayKey = today.toISOString().slice(0, 10);

    const [{ data: incomes }, { data: expenses }, { data: budget }, { data: challenges }, reminders, debts] =
      await Promise.all([
        supabase
          .from("incomes")
          .select("id, amount, source, date, note, is_recurring, created_at")
          .eq("user_id", user.id)
          .gte("date", reminderStart)
          .lte("date", monthEnd),
        supabase
          .from("expenses")
          .select("amount, category, date, created_at, note")
          .eq("user_id", user.id)
          .gte("date", monthStart)
          .lte("date", monthEnd)
          .order("date", { ascending: false }),
        supabase
          .from("budgets")
          .select("monthly_limit, savings_goal, emergency_reserve")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("user_challenges").select("status").eq("user_id", user.id).eq("status", "completed"),
        fetchOptionalRows(supabase, "reminders", user.id),
        fetchOptionalRows(supabase, "debts", user.id)
      ]);

    const normalizedIncomes = (incomes || []).map((income) => ({
      ...income,
      amount: Number(income.amount)
    }));
    const normalizedExpenses = (expenses || []).map((expense) => ({
      ...expense,
      amount: Number(expense.amount)
    }));

    const totalIncome = normalizedIncomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = normalizedExpenses.reduce((sum, item) => sum + item.amount, 0);
    const spentToday = normalizedExpenses
      .filter((item) => item.date === todayKey)
      .reduce((sum, item) => sum + item.amount, 0);
    const savingsGoal = Number(budget?.savings_goal ?? 0);
    const emergencyReserve = Number(budget?.emergency_reserve ?? 0);
    const fallbackMonthlyLimit = Math.max(totalIncome - savingsGoal - emergencyReserve, 0);
    const monthlyLimit = Number(budget?.monthly_limit ?? fallbackMonthlyLimit);
    const fixedExpenses = emergencyReserve;
    const streak = (challenges || []).length;
    const dailyBudget = calculateDailyBudget(
      totalIncome,
      fixedExpenses,
      totalExpenses,
      savingsGoal,
      daysRemaining
    );

    const sos = await getSOSState(supabase, user.id).catch(() => EMPTY_DASHBOARD_STATS.sos);
    const categoryTotals = buildCategoryTotals(normalizedExpenses, totalExpenses);

    return {
      totalIncome,
      totalExpenses,
      fixedExpenses,
      savingsGoal,
      monthlyLimit,
      emergencyReserve,
      streak,
      monthlyRank: streak >= 7 ? "Top Saver" : EMPTY_DASHBOARD_STATS.monthlyRank,
      daysElapsed,
      daysInMonth,
      daysRemaining,
      spentToday,
      entriesToday: normalizedExpenses.filter((item) => item.date === todayKey).length,
      dailyBudget,
      remainingBudget: Math.max(monthlyLimit - totalExpenses, 0),
      topCategories: categoryTotals,
      sos,
      alerts: generateAlerts({
        expenses: normalizedExpenses,
        incomes: normalizedIncomes,
        budget: {
          monthly_limit: monthlyLimit,
          savings_goal: savingsGoal,
          emergency_reserve: emergencyReserve
        },
        currentDate: today,
        reminders: ((reminders as unknown) as Array<Record<string, unknown>>).map(
          (reminder) =>
            ({
              id: String(reminder.id),
              user_id: String(reminder.user_id),
              kind: String(reminder.kind) as ReminderRecord["kind"],
              title: String(reminder.title),
              note: reminder.note ? String(reminder.note) : null,
              due_date: String(reminder.due_date),
              amount: reminder.amount === null ? null : Number(reminder.amount),
              status: String(reminder.status) as ReminderRecord["status"],
              created_at: reminder.created_at ? String(reminder.created_at) : undefined
            }) satisfies ReminderRecord
        ),
        debts: ((debts as unknown) as Array<Record<string, unknown>>).map(
          (debt) =>
            ({
              id: String(debt.id),
              user_id: String(debt.user_id),
              friend_name: String(debt.friend_name),
              amount: Number(debt.amount),
              direction: String(debt.direction) as DebtRecord["direction"],
              due_date: debt.due_date ? String(debt.due_date) : null,
              note: debt.note ? String(debt.note) : null,
              status: String(debt.status) as DebtRecord["status"],
              created_at: debt.created_at ? String(debt.created_at) : undefined
            }) satisfies DebtRecord
        )
      })
    };
  } catch {
    return EMPTY_DASHBOARD_STATS;
  }
});
