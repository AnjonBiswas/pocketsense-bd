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
  return 0;
}

function validateOnboardingPayload(body: {
  step?: number;
  complete?: boolean;
  profile?: {
    name?: string;
    university?: string;
    academic_year?: string;
    semester?: string;
  };
  income?: {
    allowance?: number;
    hasTuition?: boolean;
    tuitionAmount?: number;
    hasFreelance?: boolean;
    freelanceAmount?: number;
  };
  budget?: {
    savingsGoal?: number;
    emergencyReserve?: number;
    fixedExpenses?: FixedExpensePayload[];
  };
}) {
  const targetStep = Math.min(Math.max(Number(body.step || 1), 1), 5);
  const profile = body.profile || {};
  const income = body.income || {};
  const budget = body.budget || {};
  const allowance = income.allowance === null || income.allowance === undefined ? null : Number(income.allowance);
  const tuitionAmount = income.tuitionAmount === null || income.tuitionAmount === undefined ? null : Number(income.tuitionAmount);
  const freelanceAmount =
    income.freelanceAmount === null || income.freelanceAmount === undefined ? null : Number(income.freelanceAmount);
  const savingsGoal =
    budget.savingsGoal === null || budget.savingsGoal === undefined ? null : Number(budget.savingsGoal);
  const emergencyReserve =
    budget.emergencyReserve === null || budget.emergencyReserve === undefined ? null : Number(budget.emergencyReserve);

  if (targetStep >= 3 || body.complete) {
    if (!profile.name?.trim()) return "Name is required.";
    if (!profile.university?.trim()) return "University is required.";
    if (!profile.academic_year?.trim()) return "Academic year is required.";
    if (!profile.semester?.trim()) return "Semester is required.";
  }

  if (targetStep >= 4 || body.complete) {
    if (allowance === null) {
      return "Monthly allowance is required. Use 0 if not applicable.";
    }

    if (income.hasTuition && (!tuitionAmount || tuitionAmount <= 0)) {
      return "Tuition income amount is required.";
    }

    if (income.hasFreelance && (!freelanceAmount || freelanceAmount <= 0)) {
      return "Freelance income amount is required.";
    }

    if ((allowance || 0) + (tuitionAmount || 0) + (freelanceAmount || 0) <= 0) {
      return "At least one income amount is required.";
    }
  }

  if (targetStep >= 5 || body.complete) {
    if (savingsGoal === null) {
      return "Savings goal is required. Use 0 if you do not want one yet.";
    }

    if (emergencyReserve === null) {
      return "Emergency reserve is required. Use 0 if you do not want one yet.";
    }

    const invalidFixedExpense = (budget.fixedExpenses || []).find(
      (item) => !item.title?.trim() || Number(item.amount) <= 0
    );

    if (invalidFixedExpense) {
      return "Fixed expense items must include a title and amount.";
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        step?: number;
        complete?: boolean;
        profile?: {
          name?: string;
          phone?: string;
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
        referralCode?: string | null;
      }
    | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validationError = validateOnboardingPayload(body);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
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
      phone: profilePayload.phone?.trim() || null,
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
    const referralCode = body.referralCode?.trim() || null;

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
          theme: "light",
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

    if (Boolean(body.complete) && referralCode) {
      const { data: seedReferral } = await supabase
        .from("referrals")
        .select("referrer_user_id")
        .eq("referral_code", referralCode)
        .is("referred_user_id", null)
        .neq("referrer_user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (seedReferral?.referrer_user_id) {
        const { data: existingClaim } = await supabase
          .from("referrals")
          .select("id")
          .eq("referral_code", referralCode)
          .eq("referred_user_id", user.id)
          .maybeSingle();

        if (!existingClaim) {
          await supabase.from("referrals").insert({
            referrer_user_id: seedReferral.referrer_user_id,
            referred_user_id: user.id,
            referred_phone: user.phone || null,
            referral_code: referralCode,
            reward_xp: 500,
            status: "completed",
            completed_at: new Date().toISOString()
          });

          const [{ data: referrerProfile }, { data: referredProfile }] = await Promise.all([
            supabase.from("profiles").select("xp, level").eq("id", seedReferral.referrer_user_id).maybeSingle(),
            supabase.from("profiles").select("xp, level").eq("id", user.id).maybeSingle()
          ]);

          await Promise.all([
            supabase
              .from("profiles")
              .update({
                xp: Number(referrerProfile?.xp || 0) + 500,
                level: Math.floor((Number(referrerProfile?.xp || 0) + 500) / 1000)
              })
              .eq("id", seedReferral.referrer_user_id),
            supabase
              .from("profiles")
              .update({
                xp: Number(referredProfile?.xp || 0) + 500,
                level: Math.floor((Number(referredProfile?.xp || 0) + 500) / 1000)
              })
              .eq("id", user.id)
          ]);
        }
      }
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
