export function calculateDailyBudget(
  totalIncome: number,
  fixedExpenses: number,
  spentAmount: number,
  savingsGoal: number,
  daysRemaining: number
) {
  const safeDaysRemaining = Math.max(daysRemaining, 1);
  const availablePool = totalIncome - fixedExpenses - spentAmount - savingsGoal;

  return Math.max(0, Number((availablePool / safeDaysRemaining).toFixed(2)));
}
