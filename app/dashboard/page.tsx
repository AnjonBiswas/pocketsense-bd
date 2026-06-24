import { Suspense } from "react";
import { DailyBudgetCard } from "@/components/dashboard/DailyBudgetCard";
import { DashboardCardSkeleton } from "@/components/dashboard/DashboardCardSkeleton";
import { MonthProgressCard } from "@/components/dashboard/MonthProgressCard";
import { QuickExpenseButtons } from "@/components/dashboard/QuickExpenseButtons";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { getDashboardStats } from "@/lib/dashboard/get-dashboard-stats";

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

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Suspense fallback={<DashboardCardSkeleton tall />}>
          <StreakSection />
        </Suspense>
        <div className="rounded-[32px] border border-dashed border-primary/20 bg-white/60 p-6 shadow-sm backdrop-blur">
          <p className="text-sm font-medium text-primary">PocketSense momentum</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">ছোট খরচ দ্রুত লেখো, মাস শেষে বড় ছবিটা পরিষ্কার দেখো।</h2>
          <p className="mt-3 max-w-xl text-sm/7 text-muted-foreground">
            উপরের বাজেট আর মাসের অগ্রগতি কার্ডগুলো তোমার আজকের সিদ্ধান্ত আর পুরো মাসের ট্রেন্ড একসাথে দেখায়.
            নিচের quick buttons দিয়ে প্রতিদিনের খরচ লিখে রাখলে streak আর projection দুটোই আরও useful হবে।
          </p>
        </div>
      </div>
    </section>
  );
}
