import { addMonths, format, parseISO, startOfMonth } from "date-fns";

export type PredictableExpense = {
  amount: number;
  category: string;
  date: string;
};

export type CategoryForecast = {
  category: string;
  label: string;
  predictedAmount: number;
  trend: "up" | "down" | "steady";
};

export type StudentComparison = {
  category: string;
  label: string;
  current: number;
  average: number;
  deltaPercent: number;
  insight: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food",
  transport: "Transport",
  cafe: "Cafe",
  cigarettes: "Cigarettes",
  mobile: "Mobile",
  clothing: "Clothing",
  entertainment: "Entertainment",
  gifts: "Gifts",
  health: "Health",
  other: "Other"
};

const STUDENT_AVERAGE_BY_CATEGORY: Record<string, number> = {
  food: 2800,
  transport: 1700,
  cafe: 900,
  cigarettes: 850,
  mobile: 600,
  clothing: 750,
  entertainment: 1200,
  gifts: 500,
  health: 650,
  other: 900
};

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function linearRegression(values: number[]) {
  if (values.length <= 1) {
    return values[0] || 0;
  }

  const xValues = values.map((_, index) => index + 1);
  const n = values.length;
  const xSum = xValues.reduce((sum, value) => sum + value, 0);
  const ySum = values.reduce((sum, value) => sum + value, 0);
  const xySum = values.reduce((sum, value, index) => sum + value * xValues[index], 0);
  const xxSum = xValues.reduce((sum, value) => sum + value * value, 0);
  const denominator = n * xxSum - xSum * xSum;

  if (!denominator) {
    return values[values.length - 1] || 0;
  }

  const slope = (n * xySum - xSum * ySum) / denominator;
  const intercept = (ySum - slope * xSum) / n;
  const nextX = n + 1;

  return Math.max(0, roundCurrency(intercept + slope * nextX));
}

export function predictNextMonthExpensesByCategory(expenses: PredictableExpense[], months = 4): CategoryForecast[] {
  const groupedByCategory = expenses.reduce<Record<string, Record<string, number>>>((accumulator, expense) => {
    const monthKey = format(startOfMonth(parseISO(expense.date)), "yyyy-MM");
    accumulator[expense.category] ||= {};
    accumulator[expense.category][monthKey] = (accumulator[expense.category][monthKey] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  const lastMonthKeys = Array.from({ length: months }).map((_, index) =>
    format(startOfMonth(addMonths(new Date(), index - (months - 1))), "yyyy-MM")
  );

  return Object.entries(groupedByCategory)
    .map(([category, monthTotals]) => {
      const series = lastMonthKeys.map((monthKey) => roundCurrency(monthTotals[monthKey] || 0));
      const predictedAmount = linearRegression(series);
      const previousAmount = series[series.length - 1] || 0;
      const trend: CategoryForecast["trend"] =
        predictedAmount > previousAmount + 50 ? "up" : predictedAmount < previousAmount - 50 ? "down" : "steady";

      return {
        category,
        label: CATEGORY_LABELS[category] || category,
        predictedAmount,
        trend
      };
    })
    .sort((left, right) => right.predictedAmount - left.predictedAmount);
}

export function compareSpendingWithAverage(expenses: PredictableExpense[]): StudentComparison[] {
  const currentTotals = expenses.reduce<Record<string, number>>((accumulator, expense) => {
    accumulator[expense.category] = (accumulator[expense.category] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  return Object.entries(STUDENT_AVERAGE_BY_CATEGORY)
    .map(([category, average]) => {
      const current = roundCurrency(currentTotals[category] || 0);
      const deltaPercent = average > 0 ? roundCurrency(((current - average) / average) * 100) : 0;
      const lower = deltaPercent < 0;
      const insight = lower
        ? `You spend ${Math.abs(deltaPercent).toFixed(0)}% less than average on ${CATEGORY_LABELS[category]}. Great discipline.`
        : `You spend ${Math.abs(deltaPercent).toFixed(0)}% more than average on ${CATEGORY_LABELS[category]}.`;

      return {
        category,
        label: CATEGORY_LABELS[category] || category,
        current,
        average,
        deltaPercent,
        insight
      };
    })
    .sort((left, right) => Math.abs(right.deltaPercent) - Math.abs(left.deltaPercent));
}
