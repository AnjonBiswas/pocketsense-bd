"use client";

import { format } from "date-fns";
import { BellRing, CheckCircle2, CircleAlert } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TuitionStudentSummary } from "@/lib/utils/income";

type TuitionTrackerProps = {
  students: TuitionStudentSummary[];
  onMarkPaid: (student: TuitionStudentSummary) => void;
};

export function TuitionTracker({ students, onMarkPaid }: TuitionTrackerProps) {
  const { t } = useLanguage();

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardHeader>
        <CardTitle className="text-lg">{t("income.tuitionTrackerTitle")}</CardTitle>
        <CardDescription>{t("income.tuitionTrackerHint")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {students.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 px-4 py-6 text-sm text-muted-foreground dark:bg-slate-900/80">
            {t("income.noTuitionYet")}
          </div>
        ) : null}

        {students.map((student) => {
          const paid = student.paidThisMonth;

          return (
            <div
              key={student.name}
              className={`rounded-3xl border px-4 py-4 ${
                paid
                  ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/12"
                  : "border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/12"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {paid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <CircleAlert className="h-4 w-4 text-amber-600" />
                    )}
                    <p className="font-semibold dark:text-slate-50">{student.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("income.amountPerMonth")}: ৳{student.amountPerMonth}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("income.lastPayment")}:{" "}
                    {student.lastPaymentDate ? format(new Date(student.lastPaymentDate), "dd MMM yyyy") : t("income.never")}
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <BellRing className="h-4 w-4 text-sky-600" />
                    {student.reminderText}
                  </p>
                </div>

                <Button
                  type="button"
                  variant={paid ? "outline" : "default"}
                  className={paid ? "rounded-full" : "rounded-full bg-emerald-600 text-white hover:bg-emerald-700"}
                  onClick={() => onMarkPaid(student)}
                >
                  {t("income.markPaid")}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
