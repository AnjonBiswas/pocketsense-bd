"use client";

import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfWeek
} from "date-fns";
import { Fragment } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

type HeatmapPoint = {
  date: string;
  count: number;
};

type HeatmapCell = {
  date: Date;
  amount: number;
  isCurrentRange: boolean;
};

function getHeatLevel(amount: number, max: number) {
  if (amount <= 0 || max <= 0) {
    return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300";
  }

  const ratio = amount / max;

  if (ratio > 0.75) {
    return "bg-primary text-primary-foreground";
  }

  if (ratio > 0.5) {
    return "bg-teal-500/85 text-slate-950";
  }

  if (ratio > 0.25) {
    return "bg-emerald-200 text-emerald-950 dark:bg-emerald-100 dark:text-emerald-950";
  }

  return "bg-amber-100 text-amber-950 dark:bg-amber-50 dark:text-amber-950";
}

export function SpendingHeatmap({
  data,
  startDate,
  endDate
}: {
  data: HeatmapPoint[];
  startDate: string;
  endDate: string;
}) {
  const { language, t } = useLanguage();
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const valueMap = new Map(data.map((item) => [item.date, Number(item.count || 0)]));
  const max = Math.max(...data.map((item) => item.count), 0);
  const weekdayLabels =
    language === "bn" ? ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const alignedStart = startOfWeek(start, { weekStartsOn: 0 });
  const alignedEnd = endOfWeek(end, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: alignedStart, end: alignedEnd });

  const weeks: HeatmapCell[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(
      days.slice(index, index + 7).map((day) => {
        const key = format(day, "yyyy-MM-dd");
        return {
          date: day,
          amount: valueMap.get(key) ?? 0,
          isCurrentRange: isWithinInterval(day, { start, end })
        };
      })
    );
  }

  const monthMarkers = weeks
    .map((week, index) => ({ week: week[0], index }))
      .filter(({ week, index }) => index === 0 || !isSameMonth(week.date, weeks[index - 1][0].date))
      .map(({ week, index }) => ({
        index,
        label: format(week.date, language === "bn" ? "MMM" : "MMM")
      }));

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardHeader>
        <CardTitle>{t("reports.heatmapTitle")}</CardTitle>
        <CardDescription>{t("reports.heatmapDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <div className="min-w-[420px] rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.7))] p-4 dark:border-slate-700 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.82))]">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `40px repeat(${weeks.length}, minmax(0, 1fr))` }}
            >
              <div />
              {weeks.map((_, index) => {
                const marker = monthMarkers.find((item) => item.index === index);
                return (
                  <div
                    key={`month-${index}`}
                    className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
                  >
                    {marker?.label ?? ""}
                  </div>
                );
              })}

              {weekdayLabels.map((label, rowIndex) => (
                <Fragment key={label}>
                  <div
                    className="flex h-8 items-center pr-2 text-[11px] font-medium text-slate-500 dark:text-slate-400"
                  >
                    {label}
                  </div>
                  {weeks.map((week, columnIndex) => {
                    const cell = week[rowIndex];
                    return (
                      <div
                        key={`${columnIndex}-${label}`}
                        title={`${format(cell.date, "dd MMM yyyy")} • ৳${cell.amount.toFixed(0)}`}
                        className={[
                          "flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-semibold transition-transform duration-150 hover:-translate-y-0.5",
                          cell.isCurrentRange
                            ? getHeatLevel(cell.amount, max)
                            : "bg-transparent text-transparent"
                        ].join(" ")}
                      >
                        {cell.isCurrentRange ? cell.date.getDate() : ""}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{t("reports.heatmapLow")}</span>
          <span className="inline-block h-3 w-6 rounded-full bg-amber-100 dark:bg-amber-50" />
          <span className="inline-block h-3 w-6 rounded-full bg-emerald-200 dark:bg-emerald-100" />
          <span className="inline-block h-3 w-6 rounded-full bg-teal-500/85" />
          <span className="inline-block h-3 w-6 rounded-full bg-primary" />
          <span>{t("reports.heatmapHigh")}</span>
        </div>

        <p className="text-xs text-muted-foreground">{t("reports.heatmapFooter")}</p>
      </CardContent>
    </Card>
  );
}
