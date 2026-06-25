"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SpendingTrendPoint = {
  date: string;
  cumulative: number;
  budgetCumulative: number;
  overBudget: boolean;
};

export function SpendingTrendChart({ data }: { data: SpendingTrendPoint[] }) {
  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Spending trend</CardTitle>
        <CardDescription>Cumulative spending compared with your budget line.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => format(parseISO(value), "d")}
              tick={{ fontSize: 12 }}
            />
            <YAxis tickFormatter={(value) => `৳${Number(value).toFixed(0)}`} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number, name) => [`৳${value.toFixed(0)}`, name === "cumulative" ? "Spent" : "Budget"]}
              labelFormatter={(label) => format(parseISO(String(label)), "dd MMM yyyy")}
            />
            <Line type="monotone" dataKey="budgetCumulative" stroke="#0f766e" strokeDasharray="6 4" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="cumulative" stroke="#ef4444" strokeWidth={3} dot={false} />
            {data
              .filter((point) => point.overBudget)
              .map((point) => (
                <ReferenceDot
                  key={`${point.date}-overspend`}
                  x={point.date}
                  y={point.cumulative}
                  r={5}
                  fill="#f59e0b"
                  stroke="#b45309"
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

