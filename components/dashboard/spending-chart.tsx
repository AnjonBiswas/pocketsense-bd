"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Mon", spending: 180 },
  { name: "Tue", spending: 250 },
  { name: "Wed", spending: 220 },
  { name: "Thu", spending: 320 },
  { name: "Fri", spending: 280 }
];

export function SpendingChart() {
  return (
    <Card className="border-white/60 bg-white/85 backdrop-blur">
      <CardHeader>
        <CardTitle>Weekly spending snapshot</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <Tooltip cursor={{ fill: "rgba(15, 118, 110, 0.08)" }} />
            <Bar dataKey="spending" radius={[10, 10, 0, 0]} fill="#0f766e" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
