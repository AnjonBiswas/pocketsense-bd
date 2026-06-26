import { IncomeDashboardClient } from "@/components/income/IncomeDashboardClient";
import { createServerComponentClient } from "@/lib/supabase/server";
import { buildTuitionTracker, type IncomeRecord } from "@/lib/utils/income";

function buildFallbackIncomes(): IncomeRecord[] {
  const today = new Date();
  const month = today.toISOString().slice(0, 7);

  return [
    {
      id: "preview-income-1",
      amount: 7000,
      source: "allowance",
      date: `${month}-01`,
      note: "Family monthly support",
      is_recurring: true,
      created_at: today.toISOString()
    },
    {
      id: "preview-income-2",
      amount: 3500,
      source: "tuition",
      date: `${month}-09`,
      note: "Student: Rafi",
      is_recurring: true,
      created_at: today.toISOString()
    },
    {
      id: "preview-income-3",
      amount: 4200,
      source: "freelance",
      date: `${month}-14`,
      note: "UI design revision",
      is_recurring: false,
      created_at: today.toISOString()
    },
    {
      id: "preview-income-4",
      amount: 1000,
      source: "gift",
      date: `${month}-20`,
      note: "Birthday gift",
      is_recurring: false,
      created_at: today.toISOString()
    }
  ];
}

async function getIncomes(): Promise<IncomeRecord[]> {
  try {
    const supabase = createServerComponentClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return buildFallbackIncomes();
    }

    const { data, error } = await supabase
      .from("incomes")
      .select("id, amount, source, date, note, is_recurring, created_at")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      return [];
    }

    return (data || []).map((income) => ({
      ...income,
      amount: Number(income.amount)
    }));
  } catch {
    try {
      const supabase = createServerComponentClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      return user ? [] : buildFallbackIncomes();
    } catch {
      return [];
    }
  }
}

export default async function IncomePage() {
  const incomes = await getIncomes();

  return <IncomeDashboardClient initialIncomes={incomes} initialStudents={buildTuitionTracker(incomes)} />;
}
