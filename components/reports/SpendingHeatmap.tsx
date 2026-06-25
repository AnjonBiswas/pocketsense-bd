"use client";

import CalendarHeatmap from "react-calendar-heatmap";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HeatmapPoint = {
  date: string;
  count: number;
};

export function SpendingHeatmap({ data, startDate, endDate }: { data: HeatmapPoint[]; startDate: string; endDate: string }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Spending heatmap</CardTitle>
        <CardDescription>The darker the day, the more you spent.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[720px]">
          <CalendarHeatmap
            startDate={parseISO(startDate)}
            endDate={parseISO(endDate)}
            values={data}
            classForValue={(value) => {
              if (!value) return "color-empty";
              const ratio = (value.count || 0) / max;
              if (ratio > 0.75) return "color-scale-4";
              if (ratio > 0.5) return "color-scale-3";
              if (ratio > 0.25) return "color-scale-2";
              return "color-scale-1";
            }}
            tooltipDataAttrs={(value) =>
              value?.date
                ? {
                    "data-tip": `${format(parseISO(value.date), "dd MMM yyyy")}: ৳${Number(value.count || 0).toFixed(0)}`
                  }
                : { "data-tip": "No spending" }
            }
            showWeekdayLabels
          />
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Low</span>
          <span className="heatmap-swatch heatmap-1" />
          <span className="heatmap-swatch heatmap-2" />
          <span className="heatmap-swatch heatmap-3" />
          <span className="heatmap-swatch heatmap-4" />
          <span>High</span>
        </div>
      </CardContent>
    </Card>
  );
}
