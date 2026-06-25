"use client";

import { useMemo, useState, useTransition } from "react";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";
import { SpendingTrendChart } from "@/components/reports/SpendingTrendChart";
import { CategoryBreakdownChart } from "@/components/reports/CategoryBreakdownChart";
import { IncomeVsExpenseChart } from "@/components/reports/IncomeVsExpenseChart";
import { SpendingHeatmap } from "@/components/reports/SpendingHeatmap";
import { InsightsPanel } from "@/components/reports/InsightsPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ReportsPayload = {
  startDate: string;
  endDate: string;
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    savingsRate: number;
  };
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
    label: string;
  }>;
  dailySpending: Array<{
    date: string;
    amount: number;
    cumulative: number;
    budgetCumulative: number;
    overBudget: boolean;
  }>;
  monthlyComparison: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  heatmap: Array<{
    date: string;
    count: number;
  }>;
  insights: Array<{
    type: "pattern" | "warning" | "achievement" | "comparison";
    title: string;
    message: string;
  }>;
};

function getPresetRange(preset: "thisMonth" | "lastMonth" | "last3Months") {
  const today = new Date();
  if (preset === "lastMonth") {
    const month = subMonths(today, 1);
    return {
      startDate: format(startOfMonth(month), "yyyy-MM-dd"),
      endDate: format(endOfMonth(month), "yyyy-MM-dd")
    };
  }

  if (preset === "last3Months") {
    return {
      startDate: format(startOfMonth(subMonths(today, 2)), "yyyy-MM-dd"),
      endDate: format(endOfMonth(today), "yyyy-MM-dd")
    };
  }

  return {
    startDate: format(startOfMonth(today), "yyyy-MM-dd"),
    endDate: format(endOfMonth(today), "yyyy-MM-dd")
  };
}

export function ReportsDashboardClient({ initialData }: { initialData: ReportsPayload }) {
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState({
    preset: "thisMonth" as "thisMonth" | "lastMonth" | "last3Months" | "custom",
    startDate: initialData.startDate,
    endDate: initialData.endDate
  });
  const [isPending, startTransition] = useTransition();

  const loadReports = (startDate: string, endDate: string, preset = range.preset) => {
    startTransition(async () => {
      const response = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) return;
      setData(payload);
      setRange({ preset, startDate, endDate });
    });
  };

  const metricCards = useMemo(
    () => [
      { label: "Total Income", value: `৳${data.metrics.totalIncome.toFixed(0)}`, tone: "bg-emerald-50 text-emerald-900" },
      { label: "Total Expenses", value: `৳${data.metrics.totalExpenses.toFixed(0)}`, tone: "bg-rose-50 text-rose-900" },
      { label: "Savings", value: `৳${data.metrics.savings.toFixed(0)}`, tone: "bg-sky-50 text-sky-900" },
      { label: "Savings Rate", value: `${data.metrics.savingsRate.toFixed(1)}%`, tone: "bg-amber-50 text-amber-900" }
    ],
    [data]
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Reports</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Financial story dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Professional charts, trends, and insights for your student budget.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["thisMonth", "lastMonth", "last3Months"] as const).map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={range.preset === preset ? "default" : "outline"}
              className="rounded-full"
              onClick={() => {
                const next = getPresetRange(preset);
                loadReports(next.startDate, next.endDate, preset);
              }}
            >
              {preset === "thisMonth" ? "This Month" : preset === "lastMonth" ? "Last Month" : "Last 3 Months"}
            </Button>
          ))}
          <InputDatePair
            startDate={range.startDate}
            endDate={range.endDate}
            onApply={(startDate, endDate) => loadReports(startDate, endDate, "custom")}
          />
          <Button type="button" variant="outline" className="rounded-full" onClick={() => loadReports(range.startDate, range.endDate)}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <a href={`/api/reports/export?startDate=${range.startDate}&endDate=${range.endDate}`}>
            <Button type="button" variant="outline" className="rounded-full">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.label} className={`border-white/60 shadow-sm backdrop-blur ${card.tone}`}>
            <CardContent className="p-5">
              <p className="text-sm font-medium">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SpendingTrendChart data={data.dailySpending} />
        <InsightsPanel insights={data.insights} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <CategoryBreakdownChart data={data.categoryBreakdown} />
        <IncomeVsExpenseChart data={data.monthlyComparison} />
      </div>

      <SpendingHeatmap data={data.heatmap} startDate={data.startDate} endDate={data.endDate} />
    </section>
  );
}

function InputDatePair({
  startDate,
  endDate,
  onApply
}: {
  startDate: string;
  endDate: string;
  onApply: (startDate: string, endDate: string) => void;
}) {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm">
      <input
        type="date"
        value={localStartDate}
        onChange={(event) => setLocalStartDate(event.target.value)}
        className="rounded-full border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        type="date"
        value={localEndDate}
        onChange={(event) => setLocalEndDate(event.target.value)}
        className="rounded-full border border-slate-200 px-3 py-2 text-sm"
      />
      <Button type="button" className="rounded-full" onClick={() => onApply(localStartDate, localEndDate)}>
        Custom
      </Button>
    </div>
  );
}
