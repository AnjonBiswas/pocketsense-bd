"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

export type OnboardingData = {
  profile: {
    name: string;
    university: string;
    academic_year: string;
    semester: string;
    avatar_url: string | null;
    phone: string;
  };
  income: {
    allowance: number;
    hasTuition: boolean;
    tuitionAmount: number;
    hasFreelance: boolean;
    freelanceAmount: number;
    giftFrequency: "rarely" | "sometimes" | "often";
  };
  budget: {
    savingsGoal: number;
    emergencyReserve: number;
    fixedExpenses: Array<{
      id: string;
      title: string;
      amount: number;
      due_day: number | null;
    }>;
    firstDayOfMonth: number;
  };
};

const TOTAL_STEPS = 5;

export function useOnboarding(initialData: OnboardingData, initialStep = 1) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const safeDailyBudget = useMemo(() => {
    const totalIncome =
      data.income.allowance +
      (data.income.hasTuition ? data.income.tuitionAmount : 0) +
      (data.income.hasFreelance ? data.income.freelanceAmount : 0) +
      (data.income.giftFrequency === "often"
        ? 1200
        : data.income.giftFrequency === "sometimes"
          ? 600
          : 250);
    const fixedExpenses = data.budget.fixedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const available = totalIncome - data.budget.savingsGoal - data.budget.emergencyReserve - fixedExpenses;
    return Math.max(Number((available / 30).toFixed(2)), 0);
  }, [data]);

  function updateData(patch: {
    profile?: Partial<OnboardingData["profile"]>;
    income?: Partial<OnboardingData["income"]>;
    budget?: Partial<OnboardingData["budget"]>;
  }) {
    setData((current) => ({
      profile: { ...current.profile, ...patch.profile },
      income: { ...current.income, ...patch.income },
      budget: { ...current.budget, ...patch.budget }
    }));
  }

  function persist(nextStep: number, complete = false) {
    startTransition(async () => {
      setMessage("");
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          step: nextStep,
          complete,
          ...data
        })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setMessage(payload?.error || "Could not save onboarding progress.");
        return;
      }

      setStep(nextStep);

      if (complete) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  function next() {
    const nextStep = Math.min(step + 1, TOTAL_STEPS);
    persist(nextStep, false);
  }

  function previous() {
    setStep((current) => Math.max(current - 1, 1));
  }

  function finish() {
    persist(TOTAL_STEPS, true);
  }

  return {
    step,
    totalSteps: TOTAL_STEPS,
    data,
    updateData,
    safeDailyBudget,
    message,
    isPending,
    next,
    previous,
    finish,
    setStep
  };
}
