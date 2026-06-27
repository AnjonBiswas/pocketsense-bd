import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { createServerComponentClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { OnboardingData } from "@/lib/hooks/useOnboarding";

export const dynamic = "force-dynamic";

const emptyOnboardingData: OnboardingData = {
  profile: {
    name: "",
    university: "",
    academic_year: "",
    semester: "",
    avatar_url: null,
    phone: ""
  },
  income: {
    allowance: null,
    hasTuition: false,
    tuitionAmount: null,
    hasFreelance: false,
    freelanceAmount: null,
    giftFrequency: "rarely"
  },
  budget: {
    savingsGoal: null,
    emergencyReserve: null,
    fixedExpenses: [],
    firstDayOfMonth: 1
  }
};

export default async function OnboardingPage() {
  if (!hasSupabaseEnv()) {
    return <OnboardingWizard initialData={emptyOnboardingData} initialStep={1} />;
  }

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
      phone: profile?.phone || ""
    },
    income: {
      allowance: incomes?.find((item) => item.source === "allowance")?.amount
        ? Number(incomes.find((item) => item.source === "allowance")?.amount)
        : null,
      hasTuition: Boolean(incomes?.some((item) => item.source === "tuition")),
      tuitionAmount: incomes?.find((item) => item.source === "tuition")?.amount
        ? Number(incomes.find((item) => item.source === "tuition")?.amount)
        : null,
      hasFreelance: Boolean(incomes?.some((item) => item.source === "freelance")),
      freelanceAmount: incomes?.find((item) => item.source === "freelance")?.amount
        ? Number(incomes.find((item) => item.source === "freelance")?.amount)
        : null,
      giftFrequency: "rarely"
    },
    budget: {
      savingsGoal: budgets?.savings_goal === null || budgets?.savings_goal === undefined ? null : Number(budgets.savings_goal),
      emergencyReserve:
        budgets?.emergency_reserve === null || budgets?.emergency_reserve === undefined
          ? null
          : Number(budgets.emergency_reserve),
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
