import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { applyCacheHeaders, enforceRateLimit } from "@/lib/middleware/cache";
import { createRouteHandlerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { getSOSState } from "@/lib/sos/get-sos-state";
import { calculateDailyBudget } from "@/lib/utils/budget";
import { getCategoryMeta } from "@/lib/utils/categories";
import { generateAlerts } from "@/lib/utils/alerts";
import type { DebtRecord, ReminderRecord } from "@/lib/utils/alerts";
import type { Database } from "@/types/database.types";

export const dynamic = "force-dynamic";

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

const emptyUserStats = {
  totalIncome: 0,
  totalExpenses: 0,
  fixedExpenses: 0,
  savingsGoal: 0,
  monthlyLimit: 0,
  emergencyReserve: 0,
  streak: 0,
  monthlyRank: "Getting Started",
  spentToday: 0,
  entriesToday: 0
};

function buildFallbackAlerts() {
  return [
    { type: "warning" as const, title: "Overspending warning", message: "You're spending 20% above average." },
    { type: "info" as const, title: "Tuition reminder", message: "Tuition payment due tomorrow." },
    { type: "success" as const, title: "Friend owes money", message: "Friend owes you ৳120." }
  ];
}

async function buildEmptyAuthenticatedResponse(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  userId: string | undefined,
  daysElapsed: number,
  daysInMonth: number,
  daysRemaining: number
) {
  const sos = await getSOSState(supabase, userId).catch(() => ({
    shouldActivate: false,
    severity: "warning" as const,
    isActive: false,
    remainingBudget: 0,
    daysRemaining,
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
  }));

  return applyCacheHeaders(
    NextResponse.json({
      ...emptyUserStats,
      daysElapsed,
      daysInMonth,
      daysRemaining,
      dailyBudget: 0,
      remainingBudget: 0,
      topCategories: [],
      alerts: [],
      sos
    }),
    { maxAge: 20, staleWhileRevalidate: 120 }
  );
}

async function fetchOptionalTableRows<TTable extends keyof Database["public"]["Tables"]>(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  table: TTable,
  selection: string,
  userId: string
) {
  const rawClient = supabase as unknown as {
    from: (tableName: string) => {
      select: (columns: string) => {
        eq: (
          column: string,
          value: string
        ) => Promise<{ data: Record<string, unknown>[] | null; error: { message: string } | null }>;
      };
    };
  };
  const { data, error } = await rawClient.from(String(table)).select(selection).eq("user_id", userId);

  if (error) {
    return [];
  }

  return data || [];
}

export async function GET(request: NextRequest) {
  const today = new Date();
  const monthStart = startOfMonth(today).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(today).toISOString().slice(0, 10);
  const reminderStart = startOfMonth(subMonths(today, 1)).toISOString().slice(0, 10);
  const daysInMonth = endOfMonth(today).getDate();
  const daysElapsed = today.getDate();
  const daysRemaining = Math.max(daysInMonth - daysElapsed, 1);

  if (!hasSupabaseEnv()) {
    return applyCacheHeaders(
      NextResponse.json({
        ...emptyUserStats,
        daysElapsed,
        daysInMonth,
        daysRemaining,
        dailyBudget: 0,
        remainingBudget: 0,
        topCategories: [],
        alerts: [],
        sos: {
          shouldActivate: false,
          severity: "warning" as const,
          isActive: false,
          remainingBudget: 0,
          daysRemaining,
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
        }
      }),
      { maxAge: 20, staleWhileRevalidate: 120 }
    );
  }

  try {
    const rateLimited = enforceRateLimit(request, {
      key: "dashboard-stats",
      limit: 90,
      windowMs: 60_000
    });

    if (rateLimited) {
      return rateLimited;
    }

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

      return applyCacheHeaders(
        NextResponse.json({
          ...fallbackStats,
          entriesToday: 3,
          dailyBudget,
          remainingBudget: Math.max(fallbackStats.monthlyLimit - fallbackStats.totalExpenses, 0),
          topCategories: [],
          alerts: buildFallbackAlerts(),
          sos: await getSOSState(supabase, undefined)
        }),
        { maxAge: 20, staleWhileRevalidate: 120 }
      );
    }

    const [{ data: incomes }, { data: expenses }, { data: budget }, { data: challenges }, reminders, debts] = await Promise.all([
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
        .eq("status", "completed"),
      fetchOptionalTableRows(supabase, "reminders", "id, user_id, kind, title, note, due_date, amount, status, created_at", user.id),
      fetchOptionalTableRows(supabase, "debts", "id, user_id, friend_name, amount, direction, due_date, note, status, created_at", user.id)
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
    const totalExpenses = normalizedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const todayKey = today.toISOString().slice(0, 10);
    const spentToday = normalizedExpenses
      .filter((item) => item.date === todayKey)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const expensesBeforeToday = normalizedExpenses
      .filter((item) => item.date < todayKey)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const monthlyLimit = Number(budget?.monthly_limit ?? emptyUserStats.monthlyLimit);
    const savingsGoal = Number(budget?.savings_goal ?? emptyUserStats.savingsGoal);
    const emergencyReserve = Number(budget?.emergency_reserve ?? emptyUserStats.emergencyReserve);
    const fixedExpenses = emergencyReserve;
    const streak = (challenges || []).length;
    const remainingSpendDays = Math.max(daysInMonth - daysElapsed + 1, 1);
    const dailyBudget = Math.max(
      Number(
        (
          (totalIncome - expensesBeforeToday - savingsGoal - emergencyReserve) /
          remainingSpendDays
        ).toFixed(2)
      ),
      0
    );
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

    return applyCacheHeaders(
      NextResponse.json({
        totalIncome,
        totalExpenses,
        fixedExpenses,
        savingsGoal,
        monthlyLimit,
        emergencyReserve,
        streak,
        monthlyRank: streak >= 7 ? "Top Saver" : emptyUserStats.monthlyRank,
        daysElapsed,
        daysInMonth,
        daysRemaining,
        spentToday,
        entriesToday: normalizedExpenses.filter((item) => item.date === todayKey).length,
        dailyBudget,
        remainingBudget: Math.max(monthlyLimit - totalExpenses, 0),
        topCategories: categoryTotals,
        sos: await getSOSState(supabase, user.id),
        alerts: generateAlerts({
          expenses: normalizedExpenses,
          incomes: normalizedIncomes,
          budget: {
            monthly_limit: monthlyLimit,
            savings_goal: savingsGoal,
            emergency_reserve: emergencyReserve
          },
          currentDate: today,
          reminders: reminders.map(
            (reminder) =>
              ({
                id: String(reminder.id),
                user_id: String(reminder.user_id),
                kind: reminder.kind as ReminderRecord["kind"],
                title: String(reminder.title),
                note: reminder.note ? String(reminder.note) : null,
                due_date: String(reminder.due_date),
                amount: reminder.amount === null ? null : Number(reminder.amount),
                status: reminder.status as ReminderRecord["status"],
                created_at: reminder.created_at ? String(reminder.created_at) : undefined
              }) satisfies ReminderRecord
          ),
          debts: debts.map(
            (debt) =>
              ({
                id: String(debt.id),
                user_id: String(debt.user_id),
                friend_name: String(debt.friend_name),
                amount: Number(debt.amount),
                direction: debt.direction as DebtRecord["direction"],
                due_date: debt.due_date ? String(debt.due_date) : null,
                note: debt.note ? String(debt.note) : null,
                status: debt.status as DebtRecord["status"],
                created_at: debt.created_at ? String(debt.created_at) : undefined
              }) satisfies DebtRecord
          )
        })
      }),
      { maxAge: 20, staleWhileRevalidate: 120 }
    );
  } catch {
    if (!hasSupabaseEnv()) {
      return applyCacheHeaders(
        NextResponse.json({
          ...emptyUserStats,
          daysElapsed,
          daysInMonth,
          daysRemaining,
          dailyBudget: 0,
          remainingBudget: 0,
          topCategories: [],
          alerts: [],
          sos: {
            shouldActivate: false,
            severity: "warning" as const,
            isActive: false,
            remainingBudget: 0,
            daysRemaining,
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
          }
        }),
        { maxAge: 20, staleWhileRevalidate: 120 }
      );
    }

    const supabase = createRouteHandlerClient();
    const authResult = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const user = authResult.data.user;

    if (user) {
      return buildEmptyAuthenticatedResponse(supabase, user.id, daysElapsed, daysInMonth, daysRemaining);
    }

    const dailyBudget = calculateDailyBudget({
      totalIncome: fallbackStats.totalIncome,
      recurringIncome: 6000,
      totalExpenses: fallbackStats.totalExpenses,
      savingsGoal: fallbackStats.savingsGoal,
      emergencyReserve: fallbackStats.fixedExpenses,
      daysInMonth: fallbackStats.daysInMonth,
      currentDay: fallbackStats.daysElapsed
    });

    return applyCacheHeaders(
      NextResponse.json({
        ...fallbackStats,
        entriesToday: 3,
        dailyBudget,
        remainingBudget: Math.max(fallbackStats.monthlyLimit - fallbackStats.totalExpenses, 0),
        topCategories: [
          { category: "food", amount: 2400, percentage: 36, color: "#FF6384" },
          { category: "transport", amount: 1300, percentage: 19, color: "#36A2EB" },
          { category: "cafe", amount: 980, percentage: 15, color: "#FFCE56" },
          { category: "mobile", amount: 720, percentage: 11, color: "#4BC0C0" },
          { category: "entertainment", amount: 620, percentage: 9, color: "#FF6B6B" }
        ],
        alerts: buildFallbackAlerts(),
        sos: await getSOSState(supabase, undefined)
      }),
      { maxAge: 20, staleWhileRevalidate: 120 }
    );
  }
}
