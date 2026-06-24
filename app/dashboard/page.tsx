import { Suspense } from "react";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { DailyBudgetCard } from "@/components/dashboard/DailyBudgetCard";
import { DashboardCardSkeleton } from "@/components/dashboard/DashboardCardSkeleton";
import { MonthProgressCard } from "@/components/dashboard/MonthProgressCard";
import { QuickExpenseButtons } from "@/components/dashboard/QuickExpenseButtons";
import { RecentExpensesList } from "@/components/dashboard/RecentExpensesList";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { TopCategoriesCard } from "@/components/dashboard/TopCategoriesCard";
import { getDashboardStats } from "@/lib/dashboard/get-dashboard-stats";
import { getRecentExpenses } from "@/lib/dashboard/get-recent-expenses";

async function DailyBudgetSection() {
  const stats = await getDashboardStats();
  return <DailyBudgetCard dailyBudget={stats.dailyBudget} spentToday={stats.spentToday} />;
}

async function MonthProgressSection() {
  const stats = await getDashboardStats();
  return (
    <MonthProgressCard
      daysElapsed={stats.daysElapsed}
      daysInMonth={stats.daysInMonth}
      totalExpenses={stats.totalExpenses}
      monthlyLimit={stats.monthlyLimit}
      totalIncome={stats.totalIncome}
      savingsGoal={stats.savingsGoal}
    />
  );
}

async function StreakSection() {
  const stats = await getDashboardStats();
  return <StreakDisplay streak={stats.streak} monthlyRank={stats.monthlyRank} />;
}

async function TopCategoriesSection() {
  const stats = await getDashboardStats();
  return <TopCategoriesCard categories={stats.topCategories} />;
}

async function RecentExpensesSection() {
  const expenses = await getRecentExpenses(5);
  return <RecentExpensesList initialExpenses={expenses} />;
}

async function AlertsSection() {
  const stats = await getDashboardStats();
  return <AlertsCard alerts={stats.alerts} />;
}

export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Suspense fallback={<DashboardCardSkeleton />}>
          <DailyBudgetSection />
        </Suspense>
        <Suspense fallback={<DashboardCardSkeleton />}>
          <MonthProgressSection />
        </Suspense>
      </div>

      <QuickExpenseButtons />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Suspense fallback={<DashboardCardSkeleton tall />}>
          <StreakSection />
        </Suspense>
        <Suspense fallback={<DashboardCardSkeleton tall />}>
          <AlertsSection />
        </Suspense>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Suspense fallback={<DashboardCardSkeleton tall />}>
          <TopCategoriesSection />
        </Suspense>
        <Suspense fallback={<DashboardCardSkeleton tall />}>
          <RecentExpensesSection />
        </Suspense>
      </div>
    </section>
  );
}
