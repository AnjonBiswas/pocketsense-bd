"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CategoryBreakdownItem = {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  label: string;
};

export function CategoryBreakdownChart({ data }: { data: CategoryBreakdownItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const visibleData = useMemo(
    () => (activeCategory ? data.filter((item) => item.category === activeCategory) : data),
    [activeCategory, data]
  );

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Category breakdown</CardTitle>
        <CardDescription>See exactly where your money is going.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={visibleData} dataKey="amount" nameKey="label" innerRadius={62} outerRadius={108} paddingAngle={3}>
                {visibleData.map((item) => (
                  <Cell key={item.category} fill={item.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`৳${value.toFixed(0)}`, "Spent"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {data.map((item) => {
            const active = activeCategory === item.category;
            return (
              <button
                key={item.category}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  active ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
                onClick={() => setActiveCategory(active ? null : item.category)}
              >
                <div className="flex items-center gap-3">
                  <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <p className="font-semibold text-slate-900">৳{item.amount.toFixed(0)}</p>
              </button>
            );
          })}
          <Button type="button" variant="outline" className="w-full rounded-full" onClick={() => setActiveCategory(null)}>
            {activeCategory ? "Clear filter" : "Tap a category to filter"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

