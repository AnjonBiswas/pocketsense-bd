import { createHash } from "crypto";
import { endOfMonth, startOfMonth } from "date-fns";
import { SURVIVAL_TIPS } from "@/data/survivalTips";
import {
  calculateSurvivalBudget,
  checkSOSCondition,
  isLuxuryCategory,
  type SOSSeverity
} from "@/lib/utils/sosMode";
import type { Database } from "@/types/database.types";

export type SOSState = {
  shouldActivate: boolean;
  severity: SOSSeverity;
  isActive: boolean;
  remainingBudget: number;
  daysRemaining: number;
  dailyBudget: number;
  activatedTips: string[];
  projectedSavings: number;
  canSurvive: boolean;
  survivalTarget: number;
  hasLockedFunds: boolean;
  lockedAmount: number;
  hasPin: boolean;
  complianceScore: number;
  luxuryWarning: string | null;
};

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function hashPIN(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}

export async function getSOSState(
  supabase: {
    from: (table: keyof Database["public"]["Tables"] | string) => unknown;
  },
  userId?: string
): Promise<SOSState> {
  const client = supabase as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          gte: (column: string, value: string) => {
            lte: (
              column: string,
              value: string
            ) => Promise<{ data: Array<Record<string, unknown>> | null; error: { message: string } | null }>;
          };
          maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
        };
      };
    };
  };
  const today = new Date();
  const monthStart = startOfMonth(today).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(today).toISOString().slice(0, 10);
  const daysRemaining = Math.max(endOfMonth(today).getDate() - today.getDate(), 1);

  if (!userId) {
    const remainingBudget = 800;
    const condition = checkSOSCondition(remainingBudget, 10);
    const survivalPlan = calculateSurvivalBudget(remainingBudget, 10, []);

    return {
      shouldActivate: condition.shouldActivate,
      severity: condition.severity,
      isActive: false,
      remainingBudget,
      daysRemaining: 10,
      dailyBudget: roundCurrency(remainingBudget / 10),
      activatedTips: [],
      projectedSavings: survivalPlan.projectedSavings,
      canSurvive: survivalPlan.canSurvive,
      survivalTarget: 100,
      hasLockedFunds: false,
      lockedAmount: 0,
      hasPin: false,
      complianceScore: 0,
      luxuryWarning: "Luxury spending is risky while you are low on money."
    };
  }

  const [{ data: expenses }, { data: budget }, { data: sosRecord, error: sosError }] = await Promise.all([
    client
      .from("expenses")
      .select("amount, category, date, created_at, note, id, user_id")
      .eq("user_id", userId)
      .gte("date", monthStart)
      .lte("date", monthEnd),
    client
      .from("budgets")
      .select("monthly_limit, savings_goal, emergency_reserve, updated_at, id, user_id")
      .eq("user_id", userId)
      .maybeSingle(),
    client
      .from("sos_modes")
      .select(
        "id, user_id, is_active, severity, remaining_budget, days_remaining, activated_tips, locked_amount, lock_pin_hash, compliance_score, activated_at, updated_at, deactivated_at"
      )
      .eq("user_id", userId)
      .maybeSingle()
  ]);

  const safeExpenses = (expenses || []) as Array<{
    amount: number | string;
    category: string;
  }>;
  const totalExpenses = safeExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const monthlyLimit = Number(budget?.monthly_limit ?? 0);
  const remainingBudget = Math.max(monthlyLimit - totalExpenses, 0);
  const baselineDailyBudget = roundCurrency(remainingBudget / daysRemaining);
  const condition = checkSOSCondition(remainingBudget, daysRemaining);

  const activeTips = sosError
    ? []
    : Array.isArray(sosRecord?.activated_tips)
      ? (sosRecord.activated_tips as string[])
      : [];
  const lockedAmount = sosError ? 0 : Number(sosRecord?.locked_amount || 0);
  const usableBudget = Math.max(remainingBudget - lockedAmount, 0);
  const survivalPlan = calculateSurvivalBudget(usableBudget, daysRemaining, activeTips);
  const luxurySpendCount = safeExpenses.filter((expense) => isLuxuryCategory(expense.category)).length;
  const complianceScore = Math.max(
    0,
    Math.min(
      100,
      (sosError ? 0 : Number(sosRecord?.compliance_score || 0)) +
        Math.max(activeTips.length * 12 - luxurySpendCount * 10, 0)
    )
  );
  const recovered = !condition.shouldActivate && baselineDailyBudget >= 120;

  return {
    shouldActivate: condition.shouldActivate,
    severity: condition.severity,
    isActive: Boolean(!sosError && sosRecord?.is_active && !recovered),
    remainingBudget,
    daysRemaining,
    dailyBudget: survivalPlan.dailyBudget || baselineDailyBudget,
    activatedTips: activeTips,
    projectedSavings: survivalPlan.projectedSavings,
    canSurvive: survivalPlan.canSurvive,
    survivalTarget: 100,
    hasLockedFunds: lockedAmount > 0,
    lockedAmount,
    hasPin: Boolean(!sosError && sosRecord?.lock_pin_hash),
    complianceScore,
    luxuryWarning:
      condition.shouldActivate || (sosRecord?.is_active && luxurySpendCount >= 0)
        ? "Cafe and entertainment spending can break your survival plan."
        : null
  };
}

export function buildSOSUpsertPayload(params: {
  userId: string;
  state: SOSState;
  tipsActivated: string[];
  lockedAmount: number;
  pin?: string;
}) {
  return {
    user_id: params.userId,
    is_active: true,
    severity: params.state.severity,
    remaining_budget: params.state.remainingBudget,
    days_remaining: params.state.daysRemaining,
    activated_tips: params.tipsActivated,
    locked_amount: params.lockedAmount,
    lock_pin_hash: params.pin ? hashPIN(params.pin) : null,
    compliance_score: Math.min(params.tipsActivated.length * 10, 100),
    activated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deactivated_at: null
  } satisfies Database["public"]["Tables"]["sos_modes"]["Insert"];
}

export function buildSurvivalTipPayload(ids: string[]) {
  return SURVIVAL_TIPS.filter((tip) => ids.includes(tip.id));
}
