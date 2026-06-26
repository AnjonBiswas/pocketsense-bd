import { endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { applyCacheHeaders, enforceRateLimit } from "@/lib/middleware/cache";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { compareSpendingWithAverage, predictNextMonthExpensesByCategory } from "@/lib/ml/expensePredictor";
import { CATEGORIES, getCategoryMeta } from "@/lib/utils/categories";
import { FALLBACK_EXPENSES, normalizeExpense } from "@/lib/utils/expenses";
import { generateInsights } from "@/lib/utils/insights";
import { type IncomeRecord } from "@/lib/utils/income";

type ReportResponse = {
  startDate: string;
  endDate: string;
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    savingsRate: number;
  };
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
    label: string;
  }>;
  dailySpending: Array<{
    date: string;
    amount: number;
    cumulative: number;
    budgetCumulative: number;
    overBudget: boolean;
  }>;
  monthlyComparison: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  heatmap: Array<{
    date: string;
    count: number;
  }>;
  insights: ReturnType<typeof generateInsights>;
  forecast: Array<{
    category: string;
    label: string;
    predictedAmount: number;
    trend: "up" | "down" | "steady";
  }>;
  studentComparison: Array<{
    category: string;
    label: string;
    current: number;
    average: number;
    deltaPercent: number;
    insight: string;
  }>;
};

function buildEmptyReportResponse(startDate: string, endDate: string): ReportResponse {
  return buildResponse(startDate, endDate, [], [], []);
}

function buildFallbackIncomes(startDate: string, endDate: string): IncomeRecord[] {
  const start = parseISO(startDate);
  const month = format(start, "yyyy-MM");
  void endDate;
  return [
    {
      id: "report-income-1",
      amount: 7000,
      source: "allowance",
      date: `${month}-02`,
      note: "Allowance",
      is_recurring: true,
      created_at: new Date().toISOString()
    },
    {
      id: "report-income-2",
      amount: 3500,
      source: "tuition",
      date: `${month}-10`,
      note: "Student: Rafi",
      is_recurring: true,
      created_at: new Date().toISOString()
    },
    {
      id: "report-income-3",
      amount: 2800,
      source: "freelance",
      date: `${month}-16`,
      note: "Banner design",
      is_recurring: false,
      created_at: new Date().toISOString()
    }
  ];
}

function buildDailySpending(expenses: ReturnType<typeof normalizeExpense>[], startDate: string, endDate: string, totalIncome: number) {
  const byDate = expenses.reduce<Record<string, number>>((accumulator, expense) => {
    accumulator[expense.date] = (accumulator[expense.date] || 0) + Number(expense.amount);
    return accumulator;
  }, {});
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = Math.max(Math.floor((end.getTime() - start.getTime()) / 86400000) + 1, 1);
  const budgetPerDay = totalIncome > 0 ? totalIncome / days : 0;
  let cumulative = 0;

  return Array.from({ length: days }).map((_, index) => {
    const date = format(new Date(start.getTime() + index * 86400000), "yyyy-MM-dd");
    cumulative += byDate[date] || 0;
    const budgetCumulative = Number((budgetPerDay * (index + 1)).toFixed(2));

    return {
      date,
      amount: Number((byDate[date] || 0).toFixed(2)),
      cumulative: Number(cumulative.toFixed(2)),
      budgetCumulative,
      overBudget: cumulative > budgetCumulative
    };
  });
}

function buildCategoryBreakdown(expenses: ReturnType<typeof normalizeExpense>[]) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return Object.entries(
    expenses.reduce<Record<string, number>>((accumulator, expense) => {
      accumulator[expense.category] = (accumulator[expense.category] || 0) + expense.amount;
      return accumulator;
    }, {})
  )
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
      percentage: total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0,
      color: getCategoryMeta(category).color,
      label: getCategoryMeta(category).en
    }))
    .sort((left, right) => right.amount - left.amount);
}

function buildMonthlyComparison(expenses: ReturnType<typeof normalizeExpense>[], incomes: IncomeRecord[], endDate: string) {
  const end = parseISO(endDate);

  return [2, 1, 0].map((offset) => {
    const monthDate = subMonths(end, offset);
    const monthKey = format(monthDate, "yyyy-MM");
    const monthLabel = format(monthDate, "MMM");
    const monthExpenses = expenses
      .filter((expense) => expense.date.startsWith(monthKey))
      .reduce((sum, expense) => sum + expense.amount, 0);
    const monthIncome = incomes
      .filter((income) => income.date.startsWith(monthKey))
      .reduce((sum, income) => sum + Number(income.amount), 0);

    return {
      month: monthLabel,
      income: Number(monthIncome.toFixed(2)),
      expenses: Number(monthExpenses.toFixed(2)),
      savings: Number((monthIncome - monthExpenses).toFixed(2))
    };
  });
}

function buildHeatmap(expenses: ReturnType<typeof normalizeExpense>[]) {
  const byDate = expenses.reduce<Record<string, number>>((accumulator, expense) => {
    accumulator[expense.date] = (accumulator[expense.date] || 0) + expense.amount;
    return accumulator;
  }, {});

  return Object.entries(byDate).map(([date, count]) => ({
    date,
    count: Number(count.toFixed(2))
  }));
}

function buildResponse(
  startDate: string,
  endDate: string,
  expenses: ReturnType<typeof normalizeExpense>[],
  incomes: IncomeRecord[],
  historicalExpenses: ReturnType<typeof normalizeExpense>[] = expenses
): ReportResponse {
  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const savings = totalIncome - totalExpenses;
  const previousPeriodData = {
    expensesTotal: totalExpenses * 0.9,
    byCategory: Object.keys(CATEGORIES).reduce<Record<string, number>>((accumulator, category) => {
      const current = expenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0);
      accumulator[category] = Number((current * 0.8).toFixed(2));
      return accumulator;
    }, {})
  };

  return {
    startDate,
    endDate,
    metrics: {
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      savings: Number(savings.toFixed(2)),
      savingsRate: totalIncome > 0 ? Number(((savings / totalIncome) * 100).toFixed(1)) : 0
    },
    categoryBreakdown: buildCategoryBreakdown(expenses),
    dailySpending: buildDailySpending(expenses, startDate, endDate, totalIncome),
    monthlyComparison: buildMonthlyComparison(historicalExpenses, incomes, endDate),
    heatmap: buildHeatmap(expenses),
    insights: generateInsights(expenses, incomes, previousPeriodData),
    forecast: predictNextMonthExpensesByCategory(historicalExpenses),
    studentComparison: compareSpendingWithAverage(expenses).slice(0, 4)
  };
}

export async function GET(request: NextRequest) {
  const rateLimited = enforceRateLimit(request, {
    key: "reports",
    limit: 60,
    windowMs: 60_000
  });

  if (rateLimited) {
    return rateLimited;
  }

  const startDate = request.nextUrl.searchParams.get("startDate") || format(startOfMonth(new Date()), "yyyy-MM-dd");
  const endDate = request.nextUrl.searchParams.get("endDate") || format(endOfMonth(new Date()), "yyyy-MM-dd");

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const incomes = buildFallbackIncomes(startDate, endDate);
      const expenses = FALLBACK_EXPENSES.filter((expense) => expense.date >= startDate && expense.date <= endDate);
      return applyCacheHeaders(
        NextResponse.json(buildResponse(startDate, endDate, expenses, incomes, FALLBACK_EXPENSES)),
        { maxAge: 30, staleWhileRevalidate: 180 }
      );
    }

    const historyStartDate = format(startOfMonth(subMonths(parseISO(startDate), 3)), "yyyy-MM-dd");

    const [{ data: expenseRows, error: expenseError }, { data: incomeRows, error: incomeError }] = await Promise.all([
      supabase
        .from("expenses")
        .select("id, amount, category, note, date, created_at")
        .eq("user_id", user.id)
        .gte("date", historyStartDate)
        .lte("date", endDate)
        .order("date", { ascending: true }),
      supabase
        .from("incomes")
        .select("id, amount, source, date, note, is_recurring, created_at")
        .eq("user_id", user.id)
        .gte("date", format(startOfMonth(subMonths(parseISO(startDate), 2)), "yyyy-MM-dd"))
        .lte("date", endDate)
        .order("date", { ascending: true })
    ]);

    if (expenseError || incomeError) {
      return NextResponse.json(buildEmptyReportResponse(startDate, endDate));
    }

    const allExpenses = (expenseRows || []).map((expense) => normalizeExpense(expense));
    const expenses = allExpenses.filter((expense) => expense.date >= startDate && expense.date <= endDate);
    const incomes = (incomeRows || []).map((income) => ({
      ...income,
      amount: Number(income.amount)
    }));

    return applyCacheHeaders(
      NextResponse.json(buildResponse(startDate, endDate, expenses, incomes, allExpenses)),
      { maxAge: 30, staleWhileRevalidate: 180 }
    );
  } catch (error) {
    const supabase = createRouteHandlerClient();
    const authResult = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (authResult.data.user) {
      return applyCacheHeaders(NextResponse.json(buildEmptyReportResponse(startDate, endDate)), {
        maxAge: 30,
        staleWhileRevalidate: 180
      });
    }

    const incomes = buildFallbackIncomes(startDate, endDate);
    const expenses = FALLBACK_EXPENSES.filter((expense) => expense.date >= startDate && expense.date <= endDate);
    return applyCacheHeaders(
      NextResponse.json(buildResponse(startDate, endDate, expenses, incomes, FALLBACK_EXPENSES), {
        status: error instanceof Error ? 200 : 200
      }),
      { maxAge: 30, staleWhileRevalidate: 180 }
    );
  }
}
