"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryMeta } from "@/lib/utils/categories";
import { useExpenseStore, type Expense } from "@/store/expenseStore";

export type RecentExpenseItem = Expense;

export function RecentExpensesList() {
  const expenses = useExpenseStore((state) => state.expenses);
  const activeCategory = useExpenseStore((state) => state.filters.category);
  const setCategoryFilter = useExpenseStore((state) => state.setCategoryFilter);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const visibleExpenses = useMemo(
    () =>
      [...expenses]
        .filter((expense) => (activeCategory ? expense.category === activeCategory : true))
        .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
        .slice(0, 5),
    [activeCategory, expenses]
  );

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg">Recent expenses</CardTitle>
          <CardDescription>
            {activeCategory ? `${getCategoryMeta(activeCategory).bn} ক্যাটাগরির সর্বশেষ ৫টি লেনদেন` : "সর্বশেষ ৫টি লেনদেন"}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setCategoryFilter(undefined)}
        >
          {activeCategory ? "Clear Filter" : "See All"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleExpenses.length === 0 ? (
          <div className="rounded-2xl bg-secondary/45 px-4 py-6 text-sm text-muted-foreground dark:bg-slate-900/75">
            এখনও কোনো খরচ যোগ করা হয়নি।
          </div>
        ) : null}

        {visibleExpenses.map((expense) => {
          const meta = getCategoryMeta(expense.category);

          return (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-2xl bg-secondary/45 px-4 py-3 dark:bg-slate-900/75"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                  style={{ backgroundColor: `${meta.color}22` }}
                >
                  {meta.icon}
                </div>
                <div>
                  <p className="font-medium">{expense.note || meta.bn}</p>
                  <p className="text-xs text-muted-foreground">
                    {meta.bn} · {isHydrated ? formatDistanceToNow(new Date(expense.created_at), { addSuffix: true }) : expense.date}
                    {expense.optimistic ? " · syncing..." : ""}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-rose-600">-৳{expense.amount.toFixed(0)}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
