"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { DailyBudgetCard } from "@/components/dashboard/DailyBudgetCard";
import { MonthProgressCard } from "@/components/dashboard/MonthProgressCard";
import { QuickExpenseButtons } from "@/components/dashboard/QuickExpenseButtons";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { DashboardCardSkeleton } from "@/components/dashboard/DashboardCardSkeleton";
import { ExpenseStoreHydrator } from "@/components/dashboard/ExpenseStoreHydrator";
import type { DashboardStats } from "@/lib/dashboard/get-dashboard-stats";
import type { Expense } from "@/store/expenseStore";
import { useDashboardStore } from "@/store/dashboardStore";

const TopCategoriesCard = dynamic(
  () => import("@/components/dashboard/TopCategoriesCard").then((module) => module.TopCategoriesCard),
  {
    loading: () => <DashboardCardSkeleton tall />
  }
);

const RecentExpensesList = dynamic(
  () => import("@/components/dashboard/RecentExpensesList").then((module) => module.RecentExpensesList),
  {
    loading: () => <DashboardCardSkeleton tall />
  }
);

export function DashboardOverviewClient({
  initialStats,
  initialExpenses
}: {
  initialStats: DashboardStats;
  initialExpenses: Expense[];
}) {
  const setStats = useDashboardStore((state) => state.setStats);
  useEffect(() => {
    setStats(initialStats);
  }, [initialStats, setStats]);

  return (
    <section className="space-y-4">
      <ExpenseStoreHydrator initialExpenses={initialExpenses} />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <DailyBudgetCard dailyBudget={initialStats.dailyBudget} spentToday={initialStats.spentToday} />
        <MonthProgressCard
          daysElapsed={initialStats.daysElapsed}
          daysInMonth={initialStats.daysInMonth}
          totalExpenses={initialStats.totalExpenses}
          monthlyLimit={initialStats.monthlyLimit}
          totalIncome={initialStats.totalIncome}
          savingsGoal={initialStats.savingsGoal}
          emergencyReserve={initialStats.emergencyReserve}
        />
      </div>

      <QuickExpenseButtons />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <StreakDisplay streak={initialStats.streak} monthlyRank={initialStats.monthlyRank} />
        <AlertsCard alerts={initialStats.alerts} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <TopCategoriesCard />
        <RecentExpensesList />
      </div>
    </section>
  );
}
