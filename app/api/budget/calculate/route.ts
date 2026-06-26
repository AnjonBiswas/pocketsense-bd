import { endOfMonth, startOfMonth } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { calculateDailyBudget, calculateSpendingVelocity, predictMonthEnd, type BudgetExpense } from "@/lib/utils/budget";

export type BudgetCalculationRequest = {
  totalIncome: number;
  recurringIncome?: number;
  totalExpenses: number;
  savingsGoal?: number;
  emergencyReserve?: number;
  expenses?: BudgetExpense[];
  currentDate?: string;
};

export type BudgetCalculationResponse = {
  dailyBudget: number;
  remainingBudget: number;
  daysUntilBroke: number | null;
  recommendations: string[];
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as BudgetCalculationRequest | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const currentDate = body.currentDate ? new Date(body.currentDate) : new Date();
  const daysInMonth = endOfMonth(currentDate).getDate();
  const currentDay = currentDate.getDate();
  const daysRemaining = Math.max(daysInMonth - currentDay, 1);
  const dailyBudget = calculateDailyBudget({
    totalIncome: Number(body.totalIncome || 0),
    recurringIncome: Number(body.recurringIncome || 0),
    totalExpenses: Number(body.totalExpenses || 0),
    savingsGoal: Number(body.savingsGoal || 0),
    emergencyReserve: Number(body.emergencyReserve || 0),
    daysInMonth,
    currentDay
  });
  const remainingBudget = Math.max(
    Number(body.totalIncome || 0) -
      Number(body.totalExpenses || 0) -
      Number(body.savingsGoal || 0) -
      Number(body.emergencyReserve || 0),
    0
  );
  const velocity = calculateSpendingVelocity(
    body.expenses || [],
    startOfMonth(currentDate),
    currentDate
  );
  const prediction = predictMonthEnd(Number(body.totalExpenses || 0), currentDay, dailyBudget, daysRemaining);
  const daysUntilBroke =
    velocity > 0 && remainingBudget > 0 ? Math.max(Math.floor(remainingBudget / velocity), 0) : null;
  const recommendations: string[] = [];

  if (prediction.status === "danger") {
    recommendations.push("Reduce cafe, food, or transport spending for the next few days.");
  }

  if (velocity > dailyBudget && dailyBudget > 0) {
    recommendations.push(`Try to keep daily spending under ৳${dailyBudget.toFixed(0)} until month end.`);
  }

  if (remainingBudget <= Number(body.savingsGoal || 0)) {
    recommendations.push("Pause non-essential expenses so your savings goal stays protected.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Your budget looks healthy. Keep logging expenses daily to stay on track.");
  }

  const response: BudgetCalculationResponse = {
    dailyBudget,
    remainingBudget: Number(remainingBudget.toFixed(2)),
    daysUntilBroke,
    recommendations
  };

  return NextResponse.json(response);
}
