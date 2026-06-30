import { cache } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { createServerComponentClient } from "@/lib/supabase/server";
import { getCategoryMeta } from "@/lib/utils/categories";
import type { Expense } from "@/store/expenseStore";

export const getDashboardExpenses = cache(async (): Promise<Expense[]> => {
  try {
    const supabase = createServerComponentClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const today = new Date();
    const startDate = startOfMonth(today).toISOString().slice(0, 10);
    const endDate = endOfMonth(today).toISOString().slice(0, 10);

    const { data: expenses } = await supabase
      .from("expenses")
      .select("id, amount, category, note, date, created_at")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("created_at", { ascending: false })
      .limit(20);

    return (expenses || []).map((expense) => ({
      id: String(expense.id),
      amount: Number(expense.amount),
      category: String(expense.category),
      note: typeof expense.note === "string" ? expense.note : null,
      date: String(expense.date),
      created_at: String(expense.created_at),
      categoryDetails: getCategoryMeta(String(expense.category)),
      formattedDate: new Date(String(expense.date)).toLocaleDateString("en-GB")
    }));
  } catch {
    return [];
  }
});

