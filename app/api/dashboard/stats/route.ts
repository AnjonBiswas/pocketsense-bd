import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { calculateDailyBudget } from "@/lib/utils/budget";
import { getCategoryMeta } from "@/lib/utils/categories";
import { generateAlerts } from "@/lib/utils/alerts";

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

function buildFallbackAlerts() {
  return [
    { type: "warning" as const, title: "Overspending warning", message: "You're spending 20% above average." },
    { type: "info" as const, title: "Tuition reminder", message: "Tuition payment due tomorrow." },
    { type: "success" as const, title: "Friend owes money", message: "Friend owes you ৳120." }
  ];
}

export async function GET() {
  const today = new Date();
  const monthStart = startOfMonth(today).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(today).toISOString().slice(0, 10);
  const reminderStart = startOfMonth(subMonths(today, 1)).toISOString().slice(0, 10);
  const daysInMonth = endOfMonth(today).getDate();
  const daysElapsed = today.getDate();
  const daysRemaining = Math.max(daysInMonth - daysElapsed, 1);

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const dailyBudget = calculateDailyBudget({
        totalIncome: fallbackStats.totalIncome,
        recurringIncome: 6000,
        totalExpenses: fallbackStats.totalExpenses,
        savingsGoal: fallbackStats.savingsGoal,
        emergencyReserve: fallbackStats.fixedExpenses,
        daysInMonth: fallbackStats.daysInMonth,
        currentDay: fallbackStats.daysElapsed
      });

      return NextResponse.json({
        ...fallbackStats,
        dailyBudget,
        remainingBudget: Math.max(fallbackStats.monthlyLimit - fallbackStats.totalExpenses, 0),
        topCategories: [],
        alerts: buildFallbackAlerts()
      });
    }

    const [{ data: incomes }, { data: expenses }, { data: budget }, { data: challenges }] = await Promise.all([
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
      supabase
        .from("user_challenges")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "completed")
    ]);

    const normalizedIncomes = (incomes || []).map((income) => ({
      ...income,
      amount: Number(income.amount)
    }));
    const normalizedExpenses = (expenses || []).map((expense) => ({
      ...expense,
      amount: Number(expense.amount)
    }));
    const currentMonthIncomes = normalizedIncomes.filter(
      (income) => income.date >= monthStart && income.date <= monthEnd
    );
    const totalIncome = currentMonthIncomes.reduce((sum, item) => sum + Number(item.amount), 0);
    const recurringIncome = currentMonthIncomes
      .filter((income) => income.is_recurring)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = normalizedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const todayKey = today.toISOString().slice(0, 10);
    const spentToday = normalizedExpenses
      .filter((item) => item.date === todayKey)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const monthlyLimit = Number(budget?.monthly_limit || fallbackStats.monthlyLimit);
    const savingsGoal = Number(budget?.savings_goal || fallbackStats.savingsGoal);
    const emergencyReserve = Number(budget?.emergency_reserve || fallbackStats.emergencyReserve);
    const fixedExpenses = emergencyReserve;
    const streak = Math.max((challenges || []).length, fallbackStats.streak);
    const dailyBudget = calculateDailyBudget({
      totalIncome: totalIncome || fallbackStats.totalIncome,
      recurringIncome,
      totalExpenses,
      savingsGoal,
      emergencyReserve,
      daysInMonth,
      currentDay: daysElapsed
    });
    const categoryTotals = Object.entries(
      normalizedExpenses.reduce<Record<string, number>>((accumulator, item) => {
        accumulator[item.category] = (accumulator[item.category] || 0) + Number(item.amount);
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
      remainingBudget: Math.max(monthlyLimit - totalExpenses, 0),
      topCategories: categoryTotals,
      alerts: generateAlerts({
        expenses: normalizedExpenses,
        incomes: normalizedIncomes,
        budget: {
          monthly_limit: monthlyLimit,
          savings_goal: savingsGoal,
          emergency_reserve: emergencyReserve
        },
        currentDate: today
      })
    });
  } catch {
    const dailyBudget = calculateDailyBudget({
      totalIncome: fallbackStats.totalIncome,
      recurringIncome: 6000,
      totalExpenses: fallbackStats.totalExpenses,
      savingsGoal: fallbackStats.savingsGoal,
      emergencyReserve: fallbackStats.fixedExpenses,
      daysInMonth: fallbackStats.daysInMonth,
      currentDay: fallbackStats.daysElapsed
    });

    return NextResponse.json({
      ...fallbackStats,
      dailyBudget,
      remainingBudget: Math.max(fallbackStats.monthlyLimit - fallbackStats.totalExpenses, 0),
      topCategories: [
        { category: "food", amount: 2400, percentage: 36, color: "#FF6384" },
        { category: "transport", amount: 1300, percentage: 19, color: "#36A2EB" },
        { category: "cafe", amount: 980, percentage: 15, color: "#FFCE56" },
        { category: "mobile", amount: 720, percentage: 11, color: "#4BC0C0" },
        { category: "entertainment", amount: 620, percentage: 9, color: "#FF6B6B" }
      ],
      alerts: buildFallbackAlerts()
    });
  }
}
