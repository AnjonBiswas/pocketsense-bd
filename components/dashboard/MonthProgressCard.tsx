import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MonthProgressCardProps = {
  daysElapsed: number;
  daysInMonth: number;
  totalExpenses: number;
  monthlyLimit: number;
  totalIncome: number;
  savingsGoal: number;
};

export function MonthProgressCard({
  daysElapsed,
  daysInMonth,
  totalExpenses,
  monthlyLimit,
  totalIncome,
  savingsGoal
}: MonthProgressCardProps) {
  const spentPercentage = monthlyLimit > 0 ? Math.min((totalExpenses / monthlyLimit) * 100, 100) : 0;
  const projectedSavings = Math.max(totalIncome - totalExpenses - savingsGoal, 0);

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardHeader>
        <CardTitle className="text-lg">মাসের অগ্রগতি</CardTitle>
        <CardDescription>
          Day {daysElapsed}/{daysInMonth}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl bg-secondary/60 p-4 dark:bg-slate-900/80">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Spent vs Budget</span>
            <span>{spentPercentage.toFixed(0)}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white dark:bg-slate-800">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${spentPercentage}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>৳{totalExpenses.toFixed(0)} খরচ</span>
            <span>৳{monthlyLimit.toFixed(0)} বাজেট</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/12">
            <p className="text-sm text-emerald-900/70 dark:text-emerald-200/80">Projected savings</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-950 dark:text-emerald-100">
              ৳{projectedSavings.toFixed(0)}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-400/12">
            <p className="text-sm text-amber-900/70 dark:text-amber-200/80">Target reserve</p>
            <p className="mt-2 text-2xl font-semibold text-amber-950 dark:text-amber-100">
              ৳{savingsGoal.toFixed(0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
