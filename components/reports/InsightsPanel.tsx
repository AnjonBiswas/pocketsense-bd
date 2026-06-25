"use client";

import { Lightbulb, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Insight } from "@/lib/utils/insights";

const iconMap = {
  pattern: TrendingUp,
  warning: ShieldAlert,
  achievement: Sparkles,
  comparison: Lightbulb
} as const;

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.type];
          return (
            <div key={`${insight.title}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white p-2 text-primary shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{insight.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

