import { endOfMonth, startOfMonth } from "date-fns";
import { buildTuitionTracker, type IncomeRecord } from "@/lib/utils/income";
import {
  calculateDailyBudget,
  calculateSpendingVelocity,
  detectSpendingPattern,
  predictMonthEnd,
  type BudgetExpense
} from "@/lib/utils/budget";

export type BudgetRecord = {
  monthly_limit: number;
  savings_goal: number;
  emergency_reserve: number;
};

export type ReminderRecord = {
  id: string;
  user_id?: string;
  kind: "bill" | "tuition" | "budget_reset" | "custom";
  title: string;
  note: string | null;
  due_date: string;
  amount: number | null;
  status: "pending" | "completed" | "cancelled";
  created_at?: string;
};

export type DebtRecord = {
  id: string;
  user_id?: string;
  friend_name: string;
  amount: number;
  direction: "owed_to_me" | "i_owe";
  due_date: string | null;
  note: string | null;
  status: "pending" | "settled";
  created_at?: string;
};

export type Alert = {
  type: "warning" | "info" | "success";
  title: string;
  message: string;
};

export type GenerateAlertsInput = {
  expenses: BudgetExpense[];
  incomes: IncomeRecord[];
  budget: BudgetRecord;
  currentDate: Date;
  reminders?: ReminderRecord[];
  debts?: DebtRecord[];
};

export function generateAlerts(userData: GenerateAlertsInput): Alert[] {
  const { expenses, incomes, budget, currentDate, reminders = [], debts = [] } = userData;
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = monthEnd.getDate();
  const currentDay = currentDate.getDate();
  const daysRemaining = Math.max(daysInMonth - currentDay, 1);
  const currentMonthExpenses = expenses.filter(
    (expense) => expense.date >= monthStart.toISOString().slice(0, 10) && expense.date <= monthEnd.toISOString().slice(0, 10)
  );
  const currentMonthIncomes = incomes.filter(
    (income) => income.date >= monthStart.toISOString().slice(0, 10) && income.date <= monthEnd.toISOString().slice(0, 10)
  );
  const totalIncome = currentMonthIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const recurringIncome = currentMonthIncomes
    .filter((income) => income.is_recurring)
    .reduce((sum, income) => sum + Number(income.amount), 0);
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const dailyBudget = calculateDailyBudget({
    totalIncome,
    recurringIncome,
    totalExpenses,
    savingsGoal: Number(budget.savings_goal || 0),
    emergencyReserve: Number(budget.emergency_reserve || 0),
    daysInMonth,
    currentDay
  });
  const velocity = calculateSpendingVelocity(currentMonthExpenses, monthStart, currentDate);
  const prediction = predictMonthEnd(totalExpenses, currentDay, dailyBudget, daysRemaining);
  const alerts: Alert[] = [];

  if (velocity > dailyBudget && totalExpenses > 0) {
    alerts.push({
      type: prediction.status === "danger" ? "warning" : "info",
      title: "Overspending warning",
      message:
        prediction.status === "danger"
          ? `You are spending about ৳${velocity.toFixed(0)}/day and may overshoot by ৳${Math.abs(
              prediction.surplus
            ).toFixed(0)} this month.`
          : `Your current pace is ৳${velocity.toFixed(0)}/day, above the safe budget of ৳${dailyBudget.toFixed(0)}.`
    });
  }

  const pendingBillReminder = reminders
    .filter((reminder) => reminder.kind === "bill" && reminder.status === "pending")
    .sort((left, right) => left.due_date.localeCompare(right.due_date))[0];
  const fallbackBillExpense = currentMonthExpenses.find((expense) =>
    /(bill|tuition|rent|internet|wifi|mobile recharge|semester)/i.test(expense.note || "")
  );
  if (pendingBillReminder) {
    alerts.push({
      type: "info",
      title: "Bill due reminder",
      message: `${pendingBillReminder.title} is due on ${pendingBillReminder.due_date}${
        pendingBillReminder.amount ? ` for ৳${pendingBillReminder.amount.toFixed(0)}` : ""
      }.`
    });
  } else if (fallbackBillExpense) {
    alerts.push({
      type: "info",
      title: "Bill due reminder",
      message: `Keep room in your budget for "${fallbackBillExpense.note}" before month end.`
    });
  }

  const dedicatedTuitionReminder = reminders
    .filter((reminder) => reminder.kind === "tuition" && reminder.status === "pending")
    .sort((left, right) => left.due_date.localeCompare(right.due_date))[0];
  const inferredTuitionReminder = buildTuitionTracker(incomes, currentDate).find((student) =>
    /due|pending/i.test(student.reminderText)
  );
  if (dedicatedTuitionReminder) {
    alerts.push({
      type: "info",
      title: "Tuition reminder",
      message: `${dedicatedTuitionReminder.title} is due on ${dedicatedTuitionReminder.due_date}.`
    });
  } else if (inferredTuitionReminder) {
    alerts.push({
      type: "info",
      title: "Tuition reminder",
      message: inferredTuitionReminder.reminderText
    });
  }

  const pendingDebt = debts
    .filter((debt) => debt.status === "pending" && debt.direction === "owed_to_me")
    .sort((left, right) => right.amount - left.amount)[0];
  const owedExpense = currentMonthExpenses.find((expense) =>
    /(owe|owes|split|borrowed|due from friend)/i.test(expense.note || "")
  );
  if (pendingDebt) {
    alerts.push({
      type: "info",
      title: "Friend owes money",
      message: `${pendingDebt.friend_name} owes you ৳${pendingDebt.amount.toFixed(0)}${
        pendingDebt.due_date ? ` by ${pendingDebt.due_date}` : ""
      }.`
    });
  } else if (owedExpense?.note) {
    alerts.push({
      type: "info",
      title: "Friend owes money",
      message: owedExpense.note
    });
  }

  const savingsBalance = totalIncome - totalExpenses;
  if (budget.savings_goal > 0 && savingsBalance >= budget.savings_goal) {
    alerts.push({
      type: "success",
      title: "Savings milestone reached",
      message: `Nice work. You have already protected ৳${budget.savings_goal.toFixed(0)} for savings this month.`
    });
  }

  const budgetResetReminder = reminders.find(
    (reminder) => reminder.kind === "budget_reset" && reminder.status === "pending"
  );
  if (currentDay === 1 || budgetResetReminder) {
    alerts.push({
      type: "success",
      title: "Budget reset",
      message:
        budgetResetReminder?.note ||
        "New month, fresh budget. Review your targets before spending starts climbing."
    });
  }

  const pattern = detectSpendingPattern(currentMonthExpenses);
  if (pattern.trend === "increasing") {
    alerts.push({
      type: "warning",
      title: "Spending trend rising",
      message: `Your spending usually peaks on ${pattern.peakDay} during the ${pattern.peakTime.toLowerCase()}.`
    });
  }

  return alerts.slice(0, 6);
}
