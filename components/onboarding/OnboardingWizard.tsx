"use client";

import { BasicInfoStep } from "@/components/onboarding/BasicInfoStep";
import { BudgetStep } from "@/components/onboarding/BudgetStep";
import { IncomeStep } from "@/components/onboarding/IncomeStep";
import { TutorialStep } from "@/components/onboarding/TutorialStep";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { useOnboarding, type OnboardingData } from "@/lib/hooks/useOnboarding";

export function OnboardingWizard({
  initialData,
  initialStep
}: {
  initialData: OnboardingData;
  initialStep: number;
}) {
  const onboarding = useOnboarding(initialData, initialStep);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,216,125,0.62),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.22),transparent_34%),linear-gradient(180deg,#f8fbf7_0%,#fff7ee_100%)] px-4 py-6 dark:bg-[linear-gradient(180deg,#07121a_0%,#0b1723_100%)] md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl rounded-[40px] border border-white/60 bg-white/90 p-5 shadow-2xl shadow-slate-900/5 backdrop-blur md:p-8 dark:border-slate-700 dark:bg-slate-950/90">
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Onboarding</p>
            <p className="text-sm text-muted-foreground">
              Step {onboarding.step}/{onboarding.totalSteps}
            </p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${(onboarding.step / onboarding.totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
          {onboarding.step === 1 ? <WelcomeStep onNext={onboarding.next} /> : null}
          {onboarding.step === 2 ? (
            <BasicInfoStep
              value={onboarding.data.profile}
              onChange={(profile) => onboarding.updateData({ profile })}
              onNext={onboarding.next}
              onPrevious={onboarding.previous}
            />
          ) : null}
          {onboarding.step === 3 ? (
            <IncomeStep
              value={onboarding.data.income}
              onChange={(income) => onboarding.updateData({ income })}
              onNext={onboarding.next}
              onPrevious={onboarding.previous}
            />
          ) : null}
          {onboarding.step === 4 ? (
            <BudgetStep
              value={onboarding.data.budget}
              safeDailyBudget={onboarding.safeDailyBudget}
              onChange={(budget) => onboarding.updateData({ budget })}
              onNext={onboarding.next}
              onPrevious={onboarding.previous}
            />
          ) : null}
          {onboarding.step === 5 ? (
            <TutorialStep onPrevious={onboarding.previous} onFinish={onboarding.finish} />
          ) : null}
        </div>

        {onboarding.message ? <p className="mt-6 text-sm text-destructive">{onboarding.message}</p> : null}
        {onboarding.isPending ? <p className="mt-2 text-sm text-muted-foreground">Saving your progress...</p> : null}
      </div>
    </div>
  );
}
