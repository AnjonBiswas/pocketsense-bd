import {
  calculateDailyBudget,
  detectSpendingPattern,
  predictMonthEnd,
  type BudgetExpense
} from "@/lib/utils/budget";

describe("budget utils", () => {
  describe("calculateDailyBudget", () => {
    it("calculates daily budget from object params", () => {
      expect(
        calculateDailyBudget({
          totalIncome: 18000,
          recurringIncome: 2000,
          totalExpenses: 6000,
          savingsGoal: 3000,
          emergencyReserve: 1000,
          daysInMonth: 30,
          currentDay: 10
        })
      ).toBe(400);
    });

    it("never returns a negative budget", () => {
      expect(
        calculateDailyBudget({
          totalIncome: 1000,
          recurringIncome: 0,
          totalExpenses: 1500,
          savingsGoal: 500,
          emergencyReserve: 300,
          daysInMonth: 30,
          currentDay: 20
        })
      ).toBe(0);
    });
  });

  describe("predictMonthEnd", () => {
    it("marks healthy spending as safe", () => {
      expect(predictMonthEnd(3000, 10, 400, 20)).toEqual({
        projectedTotal: 9000,
        surplus: 2000,
        status: "safe"
      });
    });

    it("marks overspending as danger", () => {
      expect(predictMonthEnd(6000, 10, 150, 20)).toEqual({
        projectedTotal: 18000,
        surplus: -9000,
        status: "danger"
      });
    });
  });

  describe("detectSpendingPattern", () => {
    const expenses: BudgetExpense[] = [
      { amount: 80, category: "food", date: "2026-06-02", created_at: "2026-06-02T09:00:00" },
      { amount: 120, category: "food", date: "2026-06-03", created_at: "2026-06-03T19:30:00" },
      { amount: 200, category: "food", date: "2026-06-04", created_at: "2026-06-04T19:15:00" },
      { amount: 260, category: "food", date: "2026-06-05", created_at: "2026-06-05T20:00:00" }
    ];

    it("detects averages, peak windows, and trend", () => {
      expect(detectSpendingPattern(expenses, "food")).toEqual({
        averagePerDay: 165,
        peakDay: "Friday",
        peakTime: "Evening",
        trend: "increasing"
      });
    });

    it("returns a stable fallback when there are no expenses", () => {
      expect(detectSpendingPattern([], "food")).toEqual({
        averagePerDay: 0,
        peakDay: "N/A",
        peakTime: "N/A",
        trend: "stable"
      });
    });
  });
});
