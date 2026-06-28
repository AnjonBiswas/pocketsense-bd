"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { CalendarClock, RefreshCcw, Sparkles, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AddIncomeModal, type AddIncomeModalPrefill } from "@/components/income/AddIncomeModal";
import { IncomeSourceCard } from "@/components/income/IncomeSourceCard";
import { TuitionTracker } from "@/components/income/TuitionTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INCOME_SOURCES,
  type IncomeRecord,
  type TuitionStudentSummary,
  calculateTotalIncome,
  getIncomeBySource,
  getIncomeSourceMeta,
  predictNextIncome
} from "@/lib/utils/income";

type IncomeDashboardClientProps = {
  initialIncomes: IncomeRecord[];
  initialStudents: TuitionStudentSummary[];
};

export function IncomeDashboardClient({
  initialIncomes,
  initialStudents
}: IncomeDashboardClientProps) {
  const { language, t } = useLanguage();
  const [incomes, setIncomes] = useState(initialIncomes);
  const [students, setStudents] = useState(initialStudents);
  const [prefill, setPrefill] = useState<AddIncomeModalPrefill | undefined>();
  const [open, setOpen] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const response = await fetch("/api/income");
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) return;

      setIncomes(payload.incomes || []);
      setStudents(payload.summary?.tuitionTracker || []);
    });
  };

  const totalThisMonth = useMemo(() => calculateTotalIncome(incomes), [incomes]);
  const groupedHistory = useMemo(() => {
    return incomes.reduce<Record<string, IncomeRecord[]>>((accumulator, income) => {
      const key = format(new Date(income.date), "MMMM yyyy");
      accumulator[key] = [...(accumulator[key] || []), income];
      return accumulator;
    }, {});
  }, [incomes]);

  const sourceBreakdown = useMemo(
    () =>
      Object.keys(INCOME_SOURCES).map((source) => ({
        key: source,
        amount: getIncomeBySource(incomes, source),
        meta: getIncomeSourceMeta(source)
      })),
    [incomes]
  );

  const recurringPreview = useMemo(() => predictNextIncome(incomes.filter((income) => income.is_recurring)), [incomes]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700">{t("income.hub")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">{t("income.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("income.description")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" className="rounded-full" onClick={refresh} disabled={isRefreshing}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {t("income.refresh")}
          </Button>
          <Button
            type="button"
            className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => {
              setPrefill(undefined);
              setOpen(true);
            }}
          >
            {t("income.addIncome")}
          </Button>
        </div>
      </div>

      <AddIncomeModal open={open} onOpenChange={setOpen} prefill={prefill} onSuccess={refresh} />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-white/60 bg-[linear-gradient(135deg,rgba(16,185,129,0.95),rgba(6,95,70,0.95))] text-white shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-white/80">{t("income.totalIncomeThisMonth")}</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-tight">৳{totalThisMonth.toFixed(0)}</p>
                <p className="mt-2 text-sm text-white/85">{t("income.totalIncomeHint")}</p>
              </div>
              <div className="rounded-3xl bg-white/15 p-4">
                <Wallet className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
          <CardHeader>
            <CardTitle className="text-lg">{t("income.recurringForecast")}</CardTitle>
            <CardDescription>{t("income.recurringForecastHint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recurringPreview.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 px-4 py-6 text-sm text-muted-foreground dark:bg-slate-900/80">
                {t("income.noRecurringIncome")}
              </div>
            ) : null}

            {recurringPreview.slice(0, 4).map((income) => {
              const meta = getIncomeSourceMeta(income.source);

              return (
                <div
                  key={`${income.id}-${income.predictedDate}`}
                  className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/80"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                        style={{ backgroundColor: `${meta.color}22` }}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <p className="font-medium">{income.note || (language === "bn" ? meta.bn : meta.en)}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("income.expectedOn")} {income.predictedDate}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-emerald-700">৳{income.amount.toFixed(0)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
          <CardHeader>
            <CardTitle className="text-lg">{t("income.breakdownTitle")}</CardTitle>
            <CardDescription>{t("income.breakdownHint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sourceBreakdown.map((item) => (
              <div key={item.key} className="rounded-3xl bg-slate-50 px-4 py-4 dark:bg-slate-900/80">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                      style={{ backgroundColor: `${item.meta.color}22` }}
                    >
                      {item.meta.icon}
                    </div>
                    <div>
                      <p className="font-semibold dark:text-slate-50">
                        {language === "bn" ? item.meta.bn : item.meta.en}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === "bn" ? item.meta.en : item.meta.bn}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">৳{item.amount.toFixed(0)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <TuitionTracker
          students={students}
          onMarkPaid={(student) => {
            setPrefill({
              amount: student.amountPerMonth,
              source: "tuition",
              note: `Student: ${student.name}`,
              isRecurring: true,
              date: new Date().toISOString().slice(0, 10)
            });
            setOpen(true);
          }}
        />
      </div>

      <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg">{t("income.historyTitle")}</CardTitle>
            <CardDescription>{t("income.historyHint")}</CardDescription>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 dark:bg-amber-200/95 dark:text-amber-950">
            <Sparkles className="h-4 w-4" />
            {incomes.length} {t("income.entriesTracked")}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedHistory).length === 0 ? (
            <div className="rounded-3xl bg-slate-50 px-4 py-6 text-sm text-muted-foreground dark:bg-slate-900/80">
              {t("income.noIncomeHistory")}
            </div>
          ) : null}

          {Object.entries(groupedHistory).map(([month, records]) => (
            <div key={month} className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-emerald-700" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{month}</h2>
              </div>
              <div className="space-y-3">
                {records.map((income) => (
                  <IncomeSourceCard key={income.id} income={income} />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
