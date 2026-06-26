"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import { DailyBudgetCard } from "@/components/dashboard/DailyBudgetCard";
import { MonthProgressCard } from "@/components/dashboard/MonthProgressCard";
import { QuickExpenseButtons } from "@/components/dashboard/QuickExpenseButtons";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { DashboardCardSkeleton } from "@/components/dashboard/DashboardCardSkeleton";
import { ExpenseStoreHydrator } from "@/components/dashboard/ExpenseStoreHydrator";
import type { DashboardStats } from "@/lib/dashboard/get-dashboard-stats";
import { jsonFetcher } from "@/lib/fetcher";
import type { Expense } from "@/store/expenseStore";

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
  const { data: stats } = useSWR<DashboardStats>("/api/dashboard/stats", jsonFetcher, {
    fallbackData: initialStats,
    refreshInterval: 60000,
    revalidateOnFocus: false
  });

  const safeStats = stats || initialStats;

  return (
    <section className="space-y-4">
      <ExpenseStoreHydrator initialExpenses={initialExpenses} />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <DailyBudgetCard dailyBudget={safeStats.dailyBudget} spentToday={safeStats.spentToday} />
        <MonthProgressCard
          daysElapsed={safeStats.daysElapsed}
          daysInMonth={safeStats.daysInMonth}
          totalExpenses={safeStats.totalExpenses}
          monthlyLimit={safeStats.monthlyLimit}
          totalIncome={safeStats.totalIncome}
          savingsGoal={safeStats.savingsGoal}
        />
      </div>

      <QuickExpenseButtons />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <StreakDisplay streak={safeStats.streak} monthlyRank={safeStats.monthlyRank} />
        <AlertsCard alerts={safeStats.alerts} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <TopCategoriesCard />
        <RecentExpensesList />
      </div>
    </section>
  );
}
