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
    allowance: number | null;
    hasTuition: boolean;
    tuitionAmount: number | null;
    hasFreelance: boolean;
    freelanceAmount: number | null;
    giftFrequency: "rarely" | "sometimes" | "often";
  };
  budget: {
    savingsGoal: number | null;
    emergencyReserve: number | null;
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
const REFERRAL_STORAGE_KEY = "pocketsense-pending-referral";

function estimateGiftIncome(frequency: OnboardingData["income"]["giftFrequency"]) {
  if (frequency === "often") return 1200;
  if (frequency === "sometimes") return 600;
  return 0;
}

export function useOnboarding(initialData: OnboardingData, initialStep = 1) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const safeDailyBudget = useMemo(() => {
    const totalIncome =
      (data.income.allowance ?? 0) +
      (data.income.hasTuition ? (data.income.tuitionAmount ?? 0) : 0) +
      (data.income.hasFreelance ? (data.income.freelanceAmount ?? 0) : 0) +
      estimateGiftIncome(data.income.giftFrequency);
    const fixedExpenses = data.budget.fixedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const available =
      totalIncome - (data.budget.savingsGoal ?? 0) - (data.budget.emergencyReserve ?? 0) - fixedExpenses;
    return Math.max(Number((available / 30).toFixed(2)), 0);
  }, [data]);

  function validateStep(targetStep: number) {
    if (targetStep === 2) {
      return "";
    }

    if (targetStep === 3) {
      if (!data.profile.name.trim()) {
        return "Please enter your name.";
      }

      if (!data.profile.university.trim()) {
        return "Please select your university.";
      }

      if (!data.profile.academic_year.trim()) {
        return "Please select your academic year.";
      }

      if (!data.profile.semester.trim()) {
        return "Please select your semester.";
      }
    }

    if (targetStep === 4) {
      const allowance = data.income.allowance ?? 0;
      const tuitionAmount = data.income.hasTuition ? data.income.tuitionAmount ?? 0 : 0;
      const freelanceAmount = data.income.hasFreelance ? data.income.freelanceAmount ?? 0 : 0;

      if (data.income.allowance === null) {
        return "Please enter your monthly allowance. Use 0 if you do not receive one.";
      }

      if (data.income.hasTuition && tuitionAmount <= 0) {
        return "Please enter your tuition income amount.";
      }

      if (data.income.hasFreelance && freelanceAmount <= 0) {
        return "Please enter your freelance income amount.";
      }

      if (allowance + tuitionAmount + freelanceAmount <= 0) {
        return "Add at least one income amount before continuing.";
      }
    }

    if (targetStep === 5) {
      if (data.budget.savingsGoal === null) {
        return "Please enter your monthly savings goal. Use 0 if you do not want one yet.";
      }

      if (data.budget.emergencyReserve === null) {
        return "Please enter your emergency reserve amount. Use 0 if you do not want one yet.";
      }

      const invalidFixedExpense = data.budget.fixedExpenses.find(
        (item) => !item.title.trim() || Number(item.amount) <= 0
      );

      if (invalidFixedExpense) {
        return "Complete each fixed expense item or remove it before continuing.";
      }
    }

    return "";
  }

  function updateData(patch: {
    profile?: Partial<OnboardingData["profile"]>;
    income?: Partial<OnboardingData["income"]>;
    budget?: Partial<OnboardingData["budget"]>;
  }) {
    setMessage("");
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
          referralCode: typeof window !== "undefined" ? window.localStorage.getItem(REFERRAL_STORAGE_KEY) : null,
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
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
        }
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  function next() {
    const nextStep = Math.min(step + 1, TOTAL_STEPS);
    const validationMessage = validateStep(nextStep);

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    persist(nextStep, false);
  }

  function previous() {
    setMessage("");
    setStep((current) => Math.max(current - 1, 1));
  }

  function finish() {
    const validationMessage = validateStep(TOTAL_STEPS);

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

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
