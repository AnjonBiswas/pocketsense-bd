"use client";

import { ShieldAlert, TimerReset } from "lucide-react";
import { SURVIVAL_TIPS } from "@/data/survivalTips";
import { Button } from "@/components/ui/button";

type SOSModeActiveProps = {
  state: {
    isActive: boolean;
    severity: "warning" | "critical";
    remainingBudget: number;
    daysRemaining: number;
    dailyBudget: number;
    activatedTips: string[];
    complianceScore: number;
  };
  onDeactivate: () => Promise<void> | void;
};

export function SOSModeActive({ state, onDeactivate }: SOSModeActiveProps) {
  if (!state.isActive) {
    return null;
  }

  const selectedTips = SURVIVAL_TIPS.filter((tip) => state.activatedTips.includes(tip.id));
  const progress = Math.min((state.complianceScore / 100) * 100, 100);
  const toneClass =
    state.severity === "critical"
      ? "border-red-200 bg-gradient-to-r from-red-50 to-orange-50"
      : "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50";

  return (
    <div className={`mb-5 rounded-[32px] border p-5 shadow-sm ${toneClass}`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-orange-700">
            <ShieldAlert className="h-4 w-4" />
            Survival Mode Active
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Survive {state.daysRemaining} more days with ৳{state.remainingBudget}
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              Daily survival budget: ৳{state.dailyBudget} | Compliance score: {state.complianceScore}%
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTips.map((tip) => (
              <span
                key={tip.id}
                className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {tip.title.en}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-[260px] space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Month survival progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Button type="button" variant="outline" className="w-full rounded-full" onClick={onDeactivate}>
            <TimerReset className="mr-2 h-4 w-4" />
            Deactivate when recovered
          </Button>
        </div>
      </div>
    </div>
  );
}
