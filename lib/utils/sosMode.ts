import { SURVIVAL_TIPS } from "@/data/survivalTips";

export type SOSSeverity = "warning" | "critical";

export type SOSConditionResult = {
  shouldActivate: boolean;
  severity: SOSSeverity;
};

export type SurvivalBudgetResult = {
  dailyBudget: number;
  projectedSavings: number;
  canSurvive: boolean;
};

export const LUXURY_CATEGORIES = ["cafe", "entertainment"] as const;

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function isLuxuryCategory(category: string) {
  return LUXURY_CATEGORIES.includes(category as (typeof LUXURY_CATEGORIES)[number]);
}

export function checkSOSCondition(
  remainingBudget: number,
  daysRemaining: number
): SOSConditionResult {
  const safeDaysRemaining = Math.max(daysRemaining, 1);
  const survivalRate = remainingBudget / safeDaysRemaining;

  if (survivalRate < 60 || remainingBudget <= 500) {
    return {
      shouldActivate: true,
      severity: "critical"
    };
  }

  return {
    shouldActivate: survivalRate < 100,
    severity: "warning"
  };
}

export function calculateSurvivalBudget(
  remainingBudget: number,
  daysRemaining: number,
  tipsActivated: string[]
): SurvivalBudgetResult {
  const safeDaysRemaining = Math.max(daysRemaining, 1);
  const projectedSavingsPerDay = SURVIVAL_TIPS.filter((tip) => tipsActivated.includes(tip.id)).reduce(
    (sum, tip) => sum + tip.savings,
    0
  );
  const projectedSavings = roundCurrency(projectedSavingsPerDay * safeDaysRemaining);
  const adjustedBudget = remainingBudget + projectedSavings;
  const dailyBudget = roundCurrency(Math.max(adjustedBudget / safeDaysRemaining, 0));

  return {
    dailyBudget,
    projectedSavings,
    canSurvive: dailyBudget >= 100 || adjustedBudget >= 0
  };
}
