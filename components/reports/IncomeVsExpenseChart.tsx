"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ComparisonPoint = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
};

export function IncomeVsExpenseChart({ data }: { data: ComparisonPoint[] }) {
  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Income vs expense</CardTitle>
        <CardDescription>Monthly comparison with net savings line.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `৳${Number(value).toFixed(0)}`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => `৳${value.toFixed(0)}`} />
            <Bar dataKey="income" fill="#16a34a" radius={[10, 10, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[10, 10, 0, 0]} />
            <Line dataKey="savings" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
