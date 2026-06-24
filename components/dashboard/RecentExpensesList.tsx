"use client";

import { useEffect, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryMeta } from "@/lib/utils/categories";
import { useExpenseStore, type Expense } from "@/store/expenseStore";

export type RecentExpenseItem = Expense;

type RecentExpensesListProps = {
  initialExpenses: RecentExpenseItem[];
};

export function RecentExpensesList({ initialExpenses }: RecentExpensesListProps) {
  const expenses = useExpenseStore((state) => state.expenses);
  const setExpenses = useExpenseStore((state) => state.setExpenses);

  useEffect(() => {
    setExpenses(initialExpenses);
  }, [initialExpenses, setExpenses]);

  const visibleExpenses = useMemo(
    () =>
      [...expenses]
        .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
        .slice(0, 5),
    [expenses]
  );

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg">Recent expenses</CardTitle>
          <CardDescription>সর্বশেষ ৫টি লেনদেন</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-full">
          See All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleExpenses.length === 0 ? (
          <div className="rounded-2xl bg-secondary/45 px-4 py-6 text-sm text-muted-foreground">
            এখনো কোনো খরচ যোগ করা হয়নি।
          </div>
        ) : null}

        {visibleExpenses.map((expense) => {
          const meta = getCategoryMeta(expense.category);

          return (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-2xl bg-secondary/45 px-4 py-3"
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
                    {meta.bn} · {formatDistanceToNow(new Date(expense.created_at), { addSuffix: true })}
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
