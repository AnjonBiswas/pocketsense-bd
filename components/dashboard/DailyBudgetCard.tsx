import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DailyBudgetCardProps = {
  dailyBudget: number;
  spentToday: number;
};

function getBudgetTone(remainingPercentage: number) {
  if (remainingPercentage > 70) {
    return {
      label: "স্বস্তিতে আছ",
      bar: "bg-emerald-500",
      pill: "bg-emerald-100 text-emerald-900"
    };
  }

  if (remainingPercentage >= 30) {
    return {
      label: "সাবধানে খরচ করো",
      bar: "bg-amber-400",
      pill: "bg-amber-100 text-amber-900"
    };
  }

  return {
    label: "আজ একটু ধরে চল",
    bar: "bg-rose-500",
    pill: "bg-rose-100 text-rose-900"
  };
}

export function DailyBudgetCard({ dailyBudget, spentToday }: DailyBudgetCardProps) {
  const remaining = Math.max(dailyBudget - spentToday, 0);
  const remainingPercentage = dailyBudget > 0 ? Math.round((remaining / dailyBudget) * 100) : 0;
  const tone = getBudgetTone(remainingPercentage);
  const needsSetup = dailyBudget === 0 && spentToday === 0;

  return (
    <Card className="overflow-hidden border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">আজকের বাজেট</CardTitle>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.pill}`}>{tone.label}</span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">আজ খরচ করতে পারবে</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">৳{remaining.toFixed(0)}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsSetup ? (
          <div className="rounded-3xl bg-secondary/50 px-4 py-5 text-sm text-muted-foreground dark:bg-slate-900/80">
            <p>এখনও income বা budget set করা হয়নি। আগে মাসিক income আর spending limit যোগ করুন।</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild type="button" size="sm" className="rounded-full">
                <Link href="/dashboard/settings/budget">Set budget</Link>
              </Button>
              <Button asChild type="button" size="sm" variant="outline" className="rounded-full">
                <Link href="/dashboard/income">Add income</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                data-testid="daily-budget-progress"
                className={`h-full rounded-full transition-all ${tone.bar}`}
                style={{ width: `${Math.min(remainingPercentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{remainingPercentage}% বাকি</span>
              <span>আজ খরচ: ৳{spentToday.toFixed(0)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
