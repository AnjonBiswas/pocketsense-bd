"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getCategoryMeta } from "@/lib/utils/categories";
import { useExpenseStore } from "@/store/expenseStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TopCategoriesCard() {
  const expenses = useExpenseStore((state) => state.expenses);
  const activeCategory = useExpenseStore((state) => state.filters.category || null);
  const setCategoryFilter = useExpenseStore((state) => state.setCategoryFilter);

  const topFive = useMemo(() => {
    const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    return Object.entries(
      expenses.reduce<Record<string, number>>((accumulator, item) => {
        accumulator[item.category] = (accumulator[item.category] || 0) + Number(item.amount);
        return accumulator;
      }, {})
    )
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
      }))
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 5);
  }, [expenses]);

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardHeader>
        <CardTitle className="text-lg">Top categories</CardTitle>
        <CardDescription>এই মাসে কোন জায়গায় সবচেয়ে বেশি খরচ হয়েছে</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="h-[240px]">
          {topFive.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topFive}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {topFive.map((entry) => (
                    <Cell key={entry.category} fill={getCategoryMeta(entry.category).color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _name, payload) => {
                    const category = payload?.payload?.category || "other";
                    const meta = getCategoryMeta(category);
                    return [`৳${Number(value).toFixed(0)}`, meta.bn];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl bg-secondary/40 text-sm text-muted-foreground dark:bg-slate-900/80">
              No spending data yet
            </div>
          )}
        </div>

        <div className="space-y-3">
          {topFive.map((item) => {
            const meta = getCategoryMeta(item.category);
            const isActive = activeCategory === item.category;

            return (
              <button
                key={item.category}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-white/60 bg-secondary/40 hover:bg-secondary/70 dark:border-slate-700 dark:bg-slate-900/75 dark:hover:bg-slate-800"
                }`}
                onClick={() => setCategoryFilter(isActive ? undefined : item.category)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                    style={{ backgroundColor: `${meta.color}22` }}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <p className="font-semibold">{meta.bn}</p>
                    <p className="text-xs text-muted-foreground">{meta.en}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">৳{item.amount.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">{item.percentage.toFixed(0)}%</p>
                </div>
              </button>
            );
          })}

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-2xl"
            onClick={() => setCategoryFilter(undefined)}
          >
            {activeCategory ? `Filtered: ${getCategoryMeta(activeCategory).bn}` : "Tap a category to filter"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
