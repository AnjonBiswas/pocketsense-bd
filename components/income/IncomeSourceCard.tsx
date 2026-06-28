"use client";

import { format } from "date-fns";
import { BadgeDollarSign, Repeat2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { getIncomeSourceMeta, type IncomeRecord } from "@/lib/utils/income";

type IncomeSourceCardProps = {
  income: IncomeRecord;
};

export function IncomeSourceCard({ income }: IncomeSourceCardProps) {
  const { language, t } = useLanguage();
  const meta = getIncomeSourceMeta(income.source);

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl text-2xl"
            style={{ backgroundColor: `${meta.color}22` }}
          >
            {meta.icon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-slate-50">
                {language === "bn" ? meta.bn : meta.en}
              </p>
              {income.is_recurring ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-200/95 dark:text-emerald-950">
                  <Repeat2 className="h-3.5 w-3.5" />
                  {t("income.recurring")}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{income.note || (language === "bn" ? meta.bn : meta.en)}</p>
            <p className="mt-2 text-xs text-muted-foreground">{format(new Date(income.date), "dd MMM yyyy")}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="inline-flex items-center gap-1 text-lg font-semibold text-emerald-700">
            <BadgeDollarSign className="h-4 w-4" />৳{income.amount.toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground">{language === "bn" ? meta.en : meta.bn}</p>
        </div>
      </CardContent>
    </Card>
  );
}
