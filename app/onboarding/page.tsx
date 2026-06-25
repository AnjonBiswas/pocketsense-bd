import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { createServerComponentClient } from "@/lib/supabase/server";
import type { OnboardingData } from "@/lib/hooks/useOnboarding";

export default async function OnboardingPage() {
  const supabase = createServerComponentClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [{ data: profile }, { data: preferences }, { data: budgets }, { data: fixedExpenses }, { data: incomes }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "name, phone, university, avatar_url, academic_year, semester, onboarding_completed, onboarding_step"
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_preferences")
        .select("first_day_of_month")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("budgets")
        .select("savings_goal, emergency_reserve")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("budget_fixed_expenses")
        .select("id, title, amount, due_day")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("incomes")
        .select("source, amount")
        .eq("user_id", user.id)
    ]);

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  const initialData: OnboardingData = {
    profile: {
      name: profile?.name || "",
      university: profile?.university || "",
      academic_year: profile?.academic_year || "",
      semester: profile?.semester || "",
      avatar_url: profile?.avatar_url || null,
      phone: profile?.phone || user.phone || "+880"
    },
    income: {
      allowance: Number(incomes?.find((item) => item.source === "allowance")?.amount || 0),
      hasTuition: Boolean(incomes?.some((item) => item.source === "tuition")),
      tuitionAmount: Number(incomes?.find((item) => item.source === "tuition")?.amount || 0),
      hasFreelance: Boolean(incomes?.some((item) => item.source === "freelance")),
      freelanceAmount: Number(incomes?.find((item) => item.source === "freelance")?.amount || 0),
      giftFrequency: "rarely"
    },
    budget: {
      savingsGoal: Number(budgets?.savings_goal || 0),
      emergencyReserve: Number(budgets?.emergency_reserve || 0),
      fixedExpenses: (fixedExpenses || []).map((item) => ({
        id: item.id,
        title: item.title,
        amount: Number(item.amount),
        due_day: item.due_day
      })),
      firstDayOfMonth: preferences?.first_day_of_month || 1
    }
  };

  return <OnboardingWizard initialData={initialData} initialStep={profile?.onboarding_step || 1} />;
}
