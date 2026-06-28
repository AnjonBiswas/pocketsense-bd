import { IncomeDashboardClient } from "@/components/income/IncomeDashboardClient";
import { createServerComponentClient } from "@/lib/supabase/server";
import { buildTuitionTracker, type IncomeRecord } from "@/lib/utils/income";

async function getIncomes(): Promise<IncomeRecord[]> {
  try {
    const supabase = createServerComponentClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
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
    return [];
  }
}

export default async function IncomePage() {
  const incomes = await getIncomes();

  return <IncomeDashboardClient initialIncomes={incomes} initialStudents={buildTuitionTracker(incomes)} />;
}
