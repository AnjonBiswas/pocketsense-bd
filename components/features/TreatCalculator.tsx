"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowRightLeft, PiggyBank, Sparkles, WalletCards } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateTreatImpact, suggestAlternatives } from "@/lib/utils/treatImpact";
import { cn } from "@/lib/utils";

type TreatCalculatorProps = {
  amount: number;
  category: string;
  currentDailyBudget: number;
  remainingDays: number;
  remainingBudget: number;
  onTreatAnyway: () => void;
  onSplitBill: () => void;
  onCancel: () => void;
};

function AnimatedNumber({
  value,
  prefix = "৳",
  suffix = ""
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const start = previousValueRef.current;
    const delta = value - start;
    const startTime = performance.now();
    let frame = 0;

    const tick = (time: number) => {
      const progress = Math.min((time - startTime) / 320, 1);
      setDisplayValue(Number((start + delta * progress).toFixed(0)));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      previousValueRef.current = value;
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

export function TreatCalculator({
  amount,
  category,
  currentDailyBudget,
  remainingDays,
  remainingBudget,
  onTreatAnyway,
  onSplitBill,
  onCancel
}: TreatCalculatorProps) {
  const impact = useMemo(
    () => calculateTreatImpact(amount, currentDailyBudget, remainingDays, remainingBudget),
    [amount, currentDailyBudget, remainingBudget, remainingDays]
  );
  const alternatives = useMemo(() => suggestAlternatives(category, amount), [amount, category]);
  const currentDaysAffordable = Math.max(Math.floor(remainingBudget / Math.max(currentDailyBudget, 1)), 0);
  const newDaysAffordable = Math.max(
    Math.floor(Math.max(remainingBudget - amount, 0) / Math.max(currentDailyBudget, 1)),
    0
  );
  const originalBar = remainingBudget > 0 ? 100 : 0;
  const newBar = remainingBudget > 0 ? Math.max(((remainingBudget - amount) / remainingBudget) * 100, 0) : 0;
  const statusTone =
    impact.newDailyBudget < currentDailyBudget * 0.5
      ? "danger"
      : impact.newDailyBudget < currentDailyBudget * 0.75
        ? "warning"
        : "safe";

  return (
    <div className="space-y-4 rounded-[28px] border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,245,220,0.98))] p-5 shadow-inner">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-amber-100 p-3 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Treat Calculator</h3>
          <p className="text-sm text-slate-600">Little treat, big month impact. Check the tradeoff before you confirm.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-amber-200/70 bg-white/80 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Days Used</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              <AnimatedNumber value={impact.daysUsed} prefix="" suffix=" days" />
            </p>
            <p className="mt-2 text-sm text-slate-600">This uses about {impact.daysUsed.toFixed(1)} days of budget.</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/70 bg-white/80 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Daily Limit</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              <AnimatedNumber value={impact.newDailyBudget} />
            </p>
            <p className="mt-2 text-sm text-slate-600">Your daily limit drops from ৳{currentDailyBudget.toFixed(0)}.</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/70 bg-white/80 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Broke Date</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{format(impact.brokeDate, "dd MMM")}</p>
            <p className="mt-2 text-sm text-slate-600">
              Broke date moves from Day {currentDaysAffordable} to Day {newDaysAffordable}.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-[24px] border border-white/70 bg-white/80 p-4">
        <div className="mb-3 flex items-center gap-2">
          <WalletCards className="h-4 w-4 text-amber-700" />
          <p className="text-sm font-semibold text-slate-900">Budget comparison</p>
        </div>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
              <span>Before treat</span>
              <span>৳{remainingBudget.toFixed(0)} left</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${originalBar}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
              <span>After treat</span>
              <span>৳{Math.max(remainingBudget - amount, 0).toFixed(0)} left</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  statusTone === "danger"
                    ? "bg-rose-500"
                    : statusTone === "warning"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                )}
                style={{ width: `${newBar}%` }}
              />
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-700">{impact.recommendation}</p>
      </div>

      <div className="rounded-[24px] border border-white/70 bg-white/80 p-4">
        <div className="mb-3 flex items-center gap-2">
          <PiggyBank className="h-4 w-4 text-emerald-700" />
          <p className="text-sm font-semibold text-slate-900">Cheaper alternatives</p>
        </div>
        <div className="space-y-3">
          {alternatives.map((option) => (
            <div key={`${option.original}-${option.alternative}`} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {option.original} <span className="text-slate-400">→</span> {option.alternative}
                  </p>
                  <p className="text-xs text-slate-500">{option.locations.join(", ")}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-700">Save ৳{option.savings}</p>
                  <p className="text-xs text-slate-500">Spend about ৳{option.adjustedSpend.toFixed(0)}</p>
                </div>
              </div>
            </div>
          ))}
          {alternatives.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No preset alternatives yet. Consider splitting the bill or picking a smaller order.
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="outline" className="rounded-full border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100" onClick={onSplitBill}>
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Split Bill
        </Button>
        <Button
          type="button"
          className={cn(
            "rounded-full text-white",
            statusTone === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
          )}
          onClick={onTreatAnyway}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Treat Anyway
        </Button>
      </div>
    </div>
  );
}
