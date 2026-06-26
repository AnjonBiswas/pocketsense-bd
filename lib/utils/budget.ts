import { differenceInCalendarDays, format, parseISO } from "date-fns";

export type BudgetExpense = {
  id?: string;
  amount: number;
  category?: string;
  note?: string | null;
  date: string;
  created_at?: string;
};

export type DailyBudgetParams = {
  totalIncome: number;
  recurringIncome: number;
  totalExpenses: number;
  savingsGoal: number;
  emergencyReserve: number;
  daysInMonth: number;
  currentDay: number;
};

export type MonthEndPrediction = {
  projectedTotal: number;
  surplus: number;
  status: "safe" | "warning" | "danger";
};

export type SpendingPattern = {
  averagePerDay: number;
  peakDay: string;
  peakTime: string;
  trend: "increasing" | "decreasing" | "stable";
};

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function getDaysRemaining(daysInMonth: number, currentDay: number) {
  return Math.max(daysInMonth - currentDay, 1);
}

export function calculateDailyBudget(params: DailyBudgetParams): number;
export function calculateDailyBudget(
  totalIncome: number,
  fixedExpenses: number,
  spentAmount: number,
  savingsGoal: number,
  daysRemaining: number
): number;
export function calculateDailyBudget(
  paramsOrTotalIncome: DailyBudgetParams | number,
  fixedExpenses?: number,
  spentAmount?: number,
  savingsGoal?: number,
  daysRemaining?: number
) {
  if (typeof paramsOrTotalIncome === "number") {
    const safeDaysRemaining = Math.max(daysRemaining || 1, 1);
    const availablePool =
      paramsOrTotalIncome - (fixedExpenses || 0) - (spentAmount || 0) - (savingsGoal || 0);

    return Math.max(0, roundCurrency(availablePool / safeDaysRemaining));
  }

  const params = paramsOrTotalIncome;
  const safeDaysRemaining = getDaysRemaining(params.daysInMonth, params.currentDay);
  const availablePool =
    params.totalIncome -
    params.totalExpenses -
    params.savingsGoal -
    params.emergencyReserve;

  return Math.max(0, roundCurrency(availablePool / safeDaysRemaining));
}

export function calculateSpendingVelocity(
  expenses: BudgetExpense[],
  startDate: Date,
  endDate: Date
): number {
  const startKey = format(startDate, "yyyy-MM-dd");
  const endKey = format(endDate, "yyyy-MM-dd");
  const filtered = expenses.filter((expense) => expense.date >= startKey && expense.date <= endKey);
  const totalSpent = filtered.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalDays = Math.max(differenceInCalendarDays(endDate, startDate) + 1, 1);

  return roundCurrency(totalSpent / totalDays);
}

export function predictMonthEnd(
  currentSpending: number,
  daysElapsed: number,
  dailyBudget: number,
  daysRemaining: number
): MonthEndPrediction {
  const safeElapsedDays = Math.max(daysElapsed, 1);
  const projectedTotal = roundCurrency((currentSpending / safeElapsedDays) * (safeElapsedDays + daysRemaining));
  const allowedTotal = currentSpending + dailyBudget * daysRemaining;
  const surplus = roundCurrency(allowedTotal - projectedTotal);

  let status: MonthEndPrediction["status"] = "safe";

  if (surplus < 0) {
    status = "danger";
  } else if (surplus <= dailyBudget * 2) {
    status = "warning";
  }

  return {
    projectedTotal,
    surplus,
    status
  };
}

export function detectSpendingPattern(
  expenses: BudgetExpense[],
  category?: string
): SpendingPattern {
  const relevantExpenses = category
    ? expenses.filter((expense) => expense.category === category)
    : expenses;

  if (relevantExpenses.length === 0) {
    return {
      averagePerDay: 0,
      peakDay: "N/A",
      peakTime: "N/A",
      trend: "stable"
    };
  }

  const dayTotals = relevantExpenses.reduce<Record<string, number>>((accumulator, expense) => {
    const date = parseISO(expense.date);
    const dayName = format(date, "EEEE");
    accumulator[dayName] = (accumulator[dayName] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  const timeTotals = relevantExpenses.reduce<Record<string, number>>((accumulator, expense) => {
    const source = expense.created_at || `${expense.date}T12:00:00.000Z`;
    const hour = parseISO(source).getHours();
    const bucket = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : hour < 21 ? "Evening" : "Night";
    accumulator[bucket] = (accumulator[bucket] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  const sortedByDate = [...relevantExpenses].sort((left, right) => left.date.localeCompare(right.date));
  const midpoint = Math.max(Math.floor(sortedByDate.length / 2), 1);
  const firstHalfAverage =
    sortedByDate.slice(0, midpoint).reduce((sum, expense) => sum + Number(expense.amount), 0) / midpoint;
  const secondHalfLength = Math.max(sortedByDate.length - midpoint, 1);
  const secondHalfAverage =
    sortedByDate.slice(midpoint).reduce((sum, expense) => sum + Number(expense.amount), 0) / secondHalfLength;
  const trendDelta = secondHalfAverage - firstHalfAverage;

  let trend: SpendingPattern["trend"] = "stable";
  if (trendDelta > 20) trend = "increasing";
  if (trendDelta < -20) trend = "decreasing";

  const uniqueDays = new Set(relevantExpenses.map((expense) => expense.date)).size || 1;
  const peakDay = Object.entries(dayTotals).sort((left, right) => right[1] - left[1])[0]?.[0] || "N/A";
  const peakTime = Object.entries(timeTotals).sort((left, right) => right[1] - left[1])[0]?.[0] || "N/A";

  return {
    averagePerDay: roundCurrency(
      relevantExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0) / uniqueDays
    ),
    peakDay,
    peakTime,
    trend
  };
}
