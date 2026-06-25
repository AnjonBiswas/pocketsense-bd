import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/utils/categories";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type FixedExpensePayload = {
  id?: string;
  title: string;
  amount: number;
  due_day?: number | null;
};

function mapGiftFrequencyToAmount(frequency: string) {
  if (frequency === "often") return 1200;
  if (frequency === "sometimes") return 600;
  return 250;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        step?: number;
        complete?: boolean;
        profile?: {
          name?: string;
          university?: string;
          academic_year?: string;
          semester?: string;
          avatar_url?: string | null;
        };
        income?: {
          allowance?: number;
          hasTuition?: boolean;
          tuitionAmount?: number;
          hasFreelance?: boolean;
          freelanceAmount?: number;
          giftFrequency?: "rarely" | "sometimes" | "often";
        };
        budget?: {
          savingsGoal?: number;
          emergencyReserve?: number;
          monthlyLimit?: number;
          fixedExpenses?: FixedExpensePayload[];
          firstDayOfMonth?: number;
        };
      }
    | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const onboardingStep = Math.min(Math.max(Number(body.step || 1), 1), 5);
    const profilePayload = body.profile || {};
    const incomePayload = body.income || {};
    const budgetPayload = body.budget || {};
    const fixedExpenses = Array.isArray(budgetPayload.fixedExpenses)
      ? budgetPayload.fixedExpenses.filter((item) => item.title && Number(item.amount) > 0)
      : [];

    const profileUpdate = {
      name: profilePayload.name?.trim() || null,
      university: profilePayload.university?.trim() || null,
      academic_year: profilePayload.academic_year?.trim() || null,
      semester: profilePayload.semester?.trim() || null,
      avatar_url: profilePayload.avatar_url || undefined,
      onboarding_step: onboardingStep,
      onboarding_completed: Boolean(body.complete)
    } satisfies Database["public"]["Tables"]["profiles"]["Update"];

    const firstDayOfMonth = Math.min(Math.max(Number(budgetPayload.firstDayOfMonth || 1), 1), 31);
    const allowance = Math.max(Number(incomePayload.allowance || 0), 0);
    const tuitionAmount = incomePayload.hasTuition ? Math.max(Number(incomePayload.tuitionAmount || 0), 0) : 0;
    const freelanceAmount = incomePayload.hasFreelance ? Math.max(Number(incomePayload.freelanceAmount || 0), 0) : 0;
    const giftAmount = mapGiftFrequencyToAmount(incomePayload.giftFrequency || "rarely");
    const savingsGoal = Math.max(Number(budgetPayload.savingsGoal || 0), 0);
    const emergencyReserve = Math.max(Number(budgetPayload.emergencyReserve || 0), 0);
    const fixedExpenseTotal = fixedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const computedMonthlyLimit =
      Number(budgetPayload.monthlyLimit || 0) ||
      Math.max(allowance + tuitionAmount + freelanceAmount + giftAmount - savingsGoal - emergencyReserve - fixedExpenseTotal, 0);
    const currentMonthDate = `${new Date().toISOString().slice(0, 7)}-01`;

    await supabase
      .from("incomes")
      .delete()
      .eq("user_id", user.id)
      .eq("date", currentMonthDate)
      .in("source", ["allowance", "tuition", "freelance", "gift"]);

    await supabase.from("budget_fixed_expenses").delete().eq("user_id", user.id);

    await Promise.all([
      supabase.from("profiles").update(profileUpdate).eq("id", user.id),
      supabase.from("user_preferences").upsert(
        {
          user_id: user.id,
          language: "bn",
          currency: "BDT",
          theme: "system",
          first_day_of_month: firstDayOfMonth
        },
        { onConflict: "user_id" }
      ),
      supabase.from("budgets").upsert(
        {
          user_id: user.id,
          monthly_limit: computedMonthlyLimit,
          savings_goal: savingsGoal,
          emergency_reserve: emergencyReserve
        },
        { onConflict: "user_id" }
      )
    ]);

    if (allowance > 0) {
      await supabase.from("incomes").insert({
        user_id: user.id,
        amount: allowance,
        source: "allowance",
        date: currentMonthDate,
        note: "Onboarding monthly allowance",
        is_recurring: true
      });
    }

    if (tuitionAmount > 0) {
      await supabase.from("incomes").insert({
        user_id: user.id,
        amount: tuitionAmount,
        source: "tuition",
        date: currentMonthDate,
        note: "Estimated monthly tuition income",
        is_recurring: true
      });
    }

    if (freelanceAmount > 0) {
      await supabase.from("incomes").insert({
        user_id: user.id,
        amount: freelanceAmount,
        source: "freelance",
        date: currentMonthDate,
        note: "Estimated monthly freelance income",
        is_recurring: false
      });
    }

    if (giftAmount > 0) {
      await supabase.from("incomes").insert({
        user_id: user.id,
        amount: giftAmount,
        source: "gift",
        date: currentMonthDate,
        note: `Estimated gift frequency: ${incomePayload.giftFrequency || "rarely"}`,
        is_recurring: false
      });
    }

    if (fixedExpenses.length) {
      await supabase.from("budget_fixed_expenses").insert(
        fixedExpenses.map((item) => ({
          user_id: user.id,
          title: item.title,
          amount: Number(item.amount),
          due_day: item.due_day || null
        }))
      );
    }

    return NextResponse.json({
      success: true,
      onboarding_step: onboardingStep,
      onboarding_completed: Boolean(body.complete),
      categoriesConfigured: Object.keys(CATEGORIES).length
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save onboarding." },
      { status: 500 }
    );
  }
}
