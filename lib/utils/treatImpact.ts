import { addDays } from "date-fns";
import { TREAT_ALTERNATIVES, type TreatAlternativeSeed } from "@/data/alternatives";

export type Alternative = TreatAlternativeSeed & {
  adjustedSpend: number;
};

export type TreatImpactResult = {
  daysUsed: number;
  newDailyBudget: number;
  brokeDate: Date;
  recommendation: string;
};

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function calculateTreatImpact(
  treatAmount: number,
  currentDailyBudget: number,
  remainingDays: number,
  remainingBudget: number
): TreatImpactResult {
  const safeDailyBudget = Math.max(currentDailyBudget, 1);
  const safeRemainingDays = Math.max(remainingDays, 1);
  const afterTreatBudget = Math.max(remainingBudget - treatAmount, 0);
  const daysUsed = roundCurrency(treatAmount / safeDailyBudget);
  const newDailyBudget = roundCurrency(afterTreatBudget / safeRemainingDays);
  const daysAffordable = Math.max(Math.floor(afterTreatBudget / safeDailyBudget), 0);
  const brokeDate = addDays(new Date(), daysAffordable);

  let recommendation = "This treat is manageable if you keep the next few days light.";

  if (treatAmount > remainingBudget) {
    recommendation = "This treat costs more than your remaining budget. Strongly consider skipping or splitting it.";
  } else if (newDailyBudget < currentDailyBudget * 0.6) {
    recommendation = "This treat will noticeably squeeze the rest of your month. Try a cheaper alternative or split it.";
  } else if (daysUsed >= 2) {
    recommendation = "This uses multiple days of budget. Plan one or two low-spend days afterwards.";
  }

  return {
    daysUsed,
    newDailyBudget,
    brokeDate,
    recommendation
  };
}

export function suggestAlternatives(category: string, amount: number): Alternative[] {
  return TREAT_ALTERNATIVES.filter((item) => item.category === category)
    .map((item) => ({
      ...item,
      adjustedSpend: Math.max(amount - item.savings, 0)
    }))
    .sort((left, right) => right.savings - left.savings)
    .slice(0, 3);
}

