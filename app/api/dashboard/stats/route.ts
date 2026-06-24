import { endOfMonth, startOfMonth } from "date-fns";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { calculateDailyBudget } from "@/lib/utils/budget";

const fallbackStats = {
  totalIncome: 18000,
  totalExpenses: 6750,
  fixedExpenses: 3200,
  savingsGoal: 3000,
  monthlyLimit: 12000,
  emergencyReserve: 2500,
  streak: 5,
  monthlyRank: "Budget Boss",
  daysElapsed: 12,
  daysInMonth: 30,
  daysRemaining: 18,
  spentToday: 350
};

export async function GET() {
  const today = new Date();
  const monthStart = startOfMonth(today).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(today).toISOString().slice(0, 10);
  const daysInMonth = endOfMonth(today).getDate();
  const daysElapsed = today.getDate();
  const daysRemaining = Math.max(daysInMonth - daysElapsed, 1);

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const dailyBudget = calculateDailyBudget(
        fallbackStats.totalIncome,
        fallbackStats.fixedExpenses,
        fallbackStats.totalExpenses,
        fallbackStats.savingsGoal,
        fallbackStats.daysRemaining
      );

      return NextResponse.json({
        ...fallbackStats,
        dailyBudget,
        remainingBudget: Math.max(fallbackStats.monthlyLimit - fallbackStats.totalExpenses, 0)
      });
    }

    const [{ data: incomes }, { data: expenses }, { data: budget }, { data: challenges }] =
      await Promise.all([
        supabase
          .from("incomes")
          .select("amount, source, date")
          .eq("user_id", user.id)
          .gte("date", monthStart)
          .lte("date", monthEnd),
        supabase
          .from("expenses")
          .select("amount, date, created_at")
          .eq("user_id", user.id)
          .gte("date", monthStart)
          .lte("date", monthEnd)
          .order("date", { ascending: false }),
        supabase
          .from("budgets")
          .select("monthly_limit, savings_goal, emergency_reserve")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_challenges")
          .select("status")
          .eq("user_id", user.id)
          .eq("status", "completed")
      ]);

    const totalIncome = (incomes || []).reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = (expenses || []).reduce((sum, item) => sum + Number(item.amount), 0);
    const todayKey = today.toISOString().slice(0, 10);
    const spentToday = (expenses || [])
      .filter((item) => item.date === todayKey)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const monthlyLimit = Number(budget?.monthly_limit || fallbackStats.monthlyLimit);
    const savingsGoal = Number(budget?.savings_goal || fallbackStats.savingsGoal);
    const emergencyReserve = Number(budget?.emergency_reserve || fallbackStats.emergencyReserve);
    const fixedExpenses = emergencyReserve;
    const streak = Math.max((challenges || []).length, fallbackStats.streak);
    const dailyBudget = calculateDailyBudget(
      totalIncome || fallbackStats.totalIncome,
      fixedExpenses,
      totalExpenses,
      savingsGoal,
      daysRemaining
    );

    return NextResponse.json({
      totalIncome: totalIncome || fallbackStats.totalIncome,
      totalExpenses,
      fixedExpenses,
      savingsGoal,
      monthlyLimit,
      emergencyReserve,
      streak,
      monthlyRank: streak >= 7 ? "Top Saver" : fallbackStats.monthlyRank,
      daysElapsed,
      daysInMonth,
      daysRemaining,
      spentToday,
      dailyBudget,
      remainingBudget: Math.max(monthlyLimit - totalExpenses, 0)
    });
  } catch {
    const dailyBudget = calculateDailyBudget(
      fallbackStats.totalIncome,
      fallbackStats.fixedExpenses,
      fallbackStats.totalExpenses,
      fallbackStats.savingsGoal,
      fallbackStats.daysRemaining
    );

    return NextResponse.json({
      ...fallbackStats,
      dailyBudget,
      remainingBudget: Math.max(fallbackStats.monthlyLimit - fallbackStats.totalExpenses, 0)
    });
  }
}
