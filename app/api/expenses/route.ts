import { endOfMonth, startOfMonth } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { calculateDailyBudget } from "@/lib/utils/budget";
import { CATEGORIES } from "@/lib/utils/categories";

function buildFallbackStats(totalExpenses: number) {
  const totalIncome = 18000;
  const fixedExpenses = 3200;
  const savingsGoal = 3000;
  const monthLimit = 12000;
  const today = new Date();
  const daysRemaining = Math.max(endOfMonth(today).getDate() - today.getDate(), 1);

  return {
    dailyBudget: calculateDailyBudget(totalIncome, fixedExpenses, totalExpenses, savingsGoal, daysRemaining),
    totalExpenses,
    remainingBudget: Math.max(monthLimit - totalExpenses, 0)
  };
}

async function calculateUpdatedStats(userId: string, supabase: ReturnType<typeof createRouteHandlerClient>) {
  const today = new Date();
  const monthStart = startOfMonth(today).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(today).toISOString().slice(0, 10);
  const daysRemaining = Math.max(endOfMonth(today).getDate() - today.getDate(), 1);

  const [{ data: incomes }, { data: expenses }, { data: budget }] = await Promise.all([
    supabase
      .from("incomes")
      .select("amount")
      .eq("user_id", userId)
      .gte("date", monthStart)
      .lte("date", monthEnd),
    supabase
      .from("expenses")
      .select("amount")
      .eq("user_id", userId)
      .gte("date", monthStart)
      .lte("date", monthEnd),
    supabase
      .from("budgets")
      .select("monthly_limit, savings_goal, emergency_reserve")
      .eq("user_id", userId)
      .maybeSingle()
  ]);

  const totalIncome = (incomes || []).reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = (expenses || []).reduce((sum, item) => sum + Number(item.amount), 0);
  const savingsGoal = Number(budget?.savings_goal || 3000);
  const fixedExpenses = Number(budget?.emergency_reserve || 2500);
  const monthlyLimit = Number(budget?.monthly_limit || 12000);

  return {
    dailyBudget: calculateDailyBudget(totalIncome || 18000, fixedExpenses, totalExpenses, savingsGoal, daysRemaining),
    totalExpenses,
    remainingBudget: Math.max(monthlyLimit - totalExpenses, 0)
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amount = Number(body.amount);
  const category = body.category as keyof typeof CATEGORIES;
  const note = typeof body.note === "string" ? body.note.trim() : null;
  const date = typeof body.date === "string" ? body.date : "";

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  if (!category || !(category in CATEGORIES)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  if (!date) {
    return NextResponse.json({ error: "Date is required." }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const expense = {
        id: `guest-${Date.now()}`,
        amount,
        category,
        note,
        date,
        created_at: new Date().toISOString()
      };

      return NextResponse.json({
        expense,
        stats: buildFallbackStats(6750 + amount)
      });
    }

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        amount,
        category,
        note,
        date,
        user_id: user.id
      })
      .select("id, amount, category, note, date, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const stats = await calculateUpdatedStats(user.id, supabase);

    return NextResponse.json({
      expense: {
        ...expense,
        amount: Number(expense.amount)
      },
      stats
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create expense." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const startDate = request.nextUrl.searchParams.get("startDate");
  const endDate = request.nextUrl.searchParams.get("endDate");
  const category = request.nextUrl.searchParams.get("category");

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ expenses: [] });
    }

    let query = supabase
      .from("expenses")
      .select("id, amount, category, note, date, created_at")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);
    if (category) query = query.eq("category", category);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      expenses: (data || []).map((expense) => ({
        ...expense,
        amount: Number(expense.amount)
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch expenses." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Expense id is required." }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const stats = await calculateUpdatedStats(user.id, supabase);

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete expense." },
      { status: 500 }
    );
  }
}
