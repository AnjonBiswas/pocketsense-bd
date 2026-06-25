import { endOfMonth, startOfMonth } from "date-fns";
import { createClient } from "@supabase/supabase-js";
import { calculateDailyBudget } from "@/lib/utils/budget";
import type { Database } from "@/types/database.types";

export type DailyBudgetRefreshResult = {
  processedUsers: number;
  updatedBudgets: number;
  runAt: string;
};

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase service role configuration.");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function runDailyBudgetRefresh(runAt = new Date()): Promise<DailyBudgetRefreshResult> {
  const supabase = createServiceClient();
  const monthStart = startOfMonth(runAt).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(runAt).toISOString().slice(0, 10);
  const daysInMonth = endOfMonth(runAt).getDate();
  const currentDay = runAt.getDate();

  const [{ data: budgets, error: budgetsError }, { data: incomes, error: incomesError }, { data: expenses, error: expensesError }] =
    await Promise.all([
      supabase.from("budgets").select("id, user_id, monthly_limit, savings_goal, emergency_reserve"),
      supabase
        .from("incomes")
        .select("user_id, amount, is_recurring, date")
        .gte("date", monthStart)
        .lte("date", monthEnd),
      supabase
        .from("expenses")
        .select("user_id, amount, date")
        .gte("date", monthStart)
        .lte("date", monthEnd)
    ]);

  if (budgetsError || incomesError || expensesError) {
    throw new Error(budgetsError?.message || incomesError?.message || expensesError?.message || "Budget refresh failed.");
  }

  let updatedBudgets = 0;

  for (const budget of budgets || []) {
    const userIncomes = (incomes || []).filter((income) => income.user_id === budget.user_id);
    const userExpenses = (expenses || []).filter((expense) => expense.user_id === budget.user_id);
    const totalIncome = userIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
    const recurringIncome = userIncomes
      .filter((income) => income.is_recurring)
      .reduce((sum, income) => sum + Number(income.amount), 0);
    const totalExpenses = userExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const recommendedMonthlyLimit =
      calculateDailyBudget({
        totalIncome,
        recurringIncome,
        totalExpenses,
        savingsGoal: Number(budget.savings_goal || 0),
        emergencyReserve: Number(budget.emergency_reserve || 0),
        daysInMonth,
        currentDay
      }) * Math.max(daysInMonth - currentDay, 1) + totalExpenses;

    const { error } = await supabase
      .from("budgets")
      .update({
        monthly_limit: Number(recommendedMonthlyLimit.toFixed(2)),
        updated_at: runAt.toISOString()
      })
      .eq("id", budget.id);

    if (!error) {
      updatedBudgets += 1;
    }
  }

  return {
    processedUsers: budgets?.length || 0,
    updatedBudgets,
    runAt: runAt.toISOString()
  };
}

export const dailyBudgetRefreshJobGuide = {
  schedule: "0 0 * * *",
  edgeFunctionHint:
    "Deploy this function logic behind a Supabase Edge Function or external cron that calls it at midnight Asia/Dhaka."
} as const;
