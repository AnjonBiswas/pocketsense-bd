import { addDays, eachDayOfInterval, endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import type { Expense } from "@/store/expenseStore";
import type { IncomeRecord } from "@/lib/utils/income";

export type Insight = {
  type: "pattern" | "warning" | "achievement" | "comparison";
  title: string;
  message: string;
};

type PreviousPeriodData = {
  expensesTotal: number;
  byCategory: Record<string, number>;
};

function roundPercent(value: number) {
  return Number(value.toFixed(0));
}

export function generateInsights(
  expenses: Expense[],
  incomes: IncomeRecord[],
  previousPeriodData?: PreviousPeriodData
): Insight[] {
  const insights: Insight[] = [];
  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  const byWeekday = expenses.reduce<Record<string, number>>((accumulator, expense) => {
    const key = format(parseISO(expense.date), "EEEE");
    accumulator[key] = (accumulator[key] || 0) + Number(expense.amount);
    return accumulator;
  }, {});
  const weekdayEntries = Object.entries(byWeekday).sort((left, right) => right[1] - left[1]);

  if (weekdayEntries.length > 1) {
    const averageDay = weekdayEntries.reduce((sum, [, amount]) => sum + amount, 0) / weekdayEntries.length;
    const [peakDay, peakAmount] = weekdayEntries[0];
    if (averageDay > 0 && peakAmount > averageDay * 1.4) {
      insights.push({
        type: "pattern",
        title: "Weekly spending spike",
        message: `You spend about ${roundPercent(((peakAmount - averageDay) / averageDay) * 100)}% more on ${peakDay}s.`
      });
    }
  }

  const categoryTotals = expenses.reduce<Record<string, number>>((accumulator, expense) => {
    accumulator[expense.category] = (accumulator[expense.category] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  Object.entries(categoryTotals)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .forEach(([category, amount]) => {
      if (previousPeriodData?.byCategory?.[category]) {
        const previous = previousPeriodData.byCategory[category];
        const change = previous > 0 ? ((amount - previous) / previous) * 100 : 100;
        if (change >= 15) {
          insights.push({
            type: "warning",
            title: "Category warning",
            message: `${category} spending is up ${roundPercent(change)}% from the previous period.`
          });
        }
      }
    });

  if (savingsRate >= 15) {
    insights.push({
      type: "achievement",
      title: "Savings achievement",
      message: `You're saving ${roundPercent(savingsRate)}% of income. Nice discipline.`
    });
  } else if (savingsRate < 5 && totalIncome > 0) {
    insights.push({
      type: "warning",
      title: "Savings pressure",
      message: `Your savings rate is only ${roundPercent(savingsRate)}%. Try protecting a little more cash early in the month.`
    });
  }

  const studentAverage = 12000;
  if (totalExpenses > studentAverage) {
    insights.push({
      type: "comparison",
      title: "Above average spending",
      message: `You spent ৳${roundPercent(totalExpenses - studentAverage)} above the average student budget benchmark.`
    });
  } else {
    insights.push({
      type: "comparison",
      title: "Under student average",
      message: `You're tracking below the average student spend benchmark by about ৳${roundPercent(studentAverage - totalExpenses)}.`
    });
  }

  const currentWeek = expenses.filter((expense) => {
    const date = parseISO(expense.date);
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    return date >= start && date <= end;
  });
  const dailySpendMap = currentWeek.reduce<Record<string, number>>((accumulator, expense) => {
    accumulator[expense.date] = (accumulator[expense.date] || 0) + Number(expense.amount);
    return accumulator;
  }, {});
  const dayRange = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6)
  });
  const averageThisWeek =
    dayRange.reduce((sum, day) => sum + (dailySpendMap[format(day, "yyyy-MM-dd")] || 0), 0) / dayRange.length;

  if (averageThisWeek > 0) {
    insights.push({
      type: "pattern",
      title: "Current week pace",
      message: `This week you are averaging around ৳${roundPercent(averageThisWeek)} per day.`
    });
  }

  return insights.slice(0, 6);
}
