import { endOfMonth, startOfMonth } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { getSOSState, hashPIN } from "@/lib/sos/get-sos-state";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { calculateDailyBudget } from "@/lib/utils/budget";
import { isLuxuryCategory } from "@/lib/utils/sosMode";
import {
  FALLBACK_EXPENSES,
  applyExpenseFilters,
  normalizeExpense,
  paginateExpenses,
  type ExpenseQueryFilters
} from "@/lib/utils/expenses";
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

function parseFilters(request: NextRequest): ExpenseQueryFilters {
  const categories = request.nextUrl.searchParams
    .get("categories")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const fallbackCategory = request.nextUrl.searchParams.get("category");
  const search = request.nextUrl.searchParams.get("search") || undefined;
  const minAmountValue = request.nextUrl.searchParams.get("minAmount");
  const maxAmountValue = request.nextUrl.searchParams.get("maxAmount");
  const pageValue = request.nextUrl.searchParams.get("page");
  const limitValue = request.nextUrl.searchParams.get("limit");

  return {
    startDate: request.nextUrl.searchParams.get("startDate") || undefined,
    endDate: request.nextUrl.searchParams.get("endDate") || undefined,
    categories: categories?.length ? categories : fallbackCategory ? [fallbackCategory] : undefined,
    search,
    minAmount: minAmountValue ? Number(minAmountValue) : undefined,
    maxAmount: maxAmountValue ? Number(maxAmountValue) : undefined,
    page: pageValue ? Math.max(Number(pageValue), 1) : 1,
    limit: limitValue ? Math.max(Number(limitValue), 1) : 10
  };
}

function validateExpensePayload(body: Record<string, unknown>) {
  const amount = Number(body.amount);
  const category = body.category as keyof typeof CATEGORIES;
  const note = typeof body.note === "string" ? body.note.trim() : null;
  const date = typeof body.date === "string" ? body.date : "";

  if (!amount || amount <= 0) {
    return { error: "Amount must be greater than zero." };
  }

  if (!category || !(category in CATEGORIES)) {
    return { error: "Invalid category." };
  }

  if (!date) {
    return { error: "Date is required." };
  }

  return {
    value: {
      amount,
      category,
      note,
      date
    }
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateExpensePayload(body);

  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const expense = {
        id: `guest-${Date.now()}`,
        ...validation.value,
        created_at: new Date().toISOString()
      };

      return NextResponse.json({
        expense,
        stats: buildFallbackStats(6750 + expense.amount)
      });
    }

    const sosState = await getSOSState(supabase, user.id);
    const overrideEmergency = Boolean(body.overrideEmergency);
    const unlockPin = typeof body.unlockPin === "string" ? body.unlockPin : "";

    if (sosState.isActive && isLuxuryCategory(validation.value.category)) {
      if (sosState.hasPin) {
        const { data: sosRecord } = await supabase
          .from("sos_modes")
          .select("lock_pin_hash")
          .eq("user_id", user.id)
          .maybeSingle();
        const isValid = unlockPin ? hashPIN(unlockPin) === sosRecord?.lock_pin_hash : false;

        if (!isValid) {
          return NextResponse.json(
            {
              error: "SOS mode is active. Enter your emergency PIN to continue.",
              code: "SOS_PIN_REQUIRED",
              sos: sosState
            },
            { status: 423 }
          );
        }
      } else if (!overrideEmergency) {
        return NextResponse.json(
          {
            error: "SOS mode is active. Confirm the emergency override before continuing.",
            code: "SOS_WARNING",
            sos: sosState
          },
          { status: 409 }
        );
      }
    }

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        ...validation.value,
        user_id: user.id
      })
      .select("id, amount, category, note, date, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const stats = await calculateUpdatedStats(user.id, supabase);

    if (sosState.isActive) {
      const { data: currentMode } = await supabase
        .from("sos_modes")
        .select("compliance_score")
        .eq("user_id", user.id)
        .maybeSingle();
      const currentScore = Number(currentMode?.compliance_score || 0);
      const nextScore = Math.max(
        0,
        Math.min(100, currentScore + (isLuxuryCategory(validation.value.category) ? -20 : 8))
      );

      await supabase
        .from("sos_modes")
        .update({
          compliance_score: nextScore
        })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      expense: normalizeExpense(expense),
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
  const filters = parseFilters(request);

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const filtered = applyExpenseFilters(FALLBACK_EXPENSES, filters);
      const paginated = paginateExpenses(filtered, filters.page, filters.limit);
      const totalSpent = filtered.reduce((sum, expense) => sum + expense.amount, 0);

      return NextResponse.json({
        expenses: paginated.data,
        meta: {
          page: paginated.page,
          limit: paginated.limit,
          total: paginated.total,
          totalPages: paginated.totalPages,
          hasMore: paginated.hasMore,
          totalSpent
        }
      });
    }

    let query = supabase
      .from("expenses")
      .select("id, amount, category, note, date, created_at", { count: "exact" })
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters.startDate) query = query.gte("date", filters.startDate);
    if (filters.endDate) query = query.lte("date", filters.endDate);
    if (filters.categories?.length) query = query.in("category", filters.categories);
    if (typeof filters.minAmount === "number") query = query.gte("amount", filters.minAmount);
    if (typeof filters.maxAmount === "number") query = query.lte("amount", filters.maxAmount);
    if (filters.search) query = query.ilike("note", `%${filters.search}%`);

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const normalized = (data || []).map((expense) => normalizeExpense(expense));
    let totalQuery = supabase.from("expenses").select("amount").eq("user_id", user.id);

    if (filters.startDate) totalQuery = totalQuery.gte("date", filters.startDate);
    if (filters.endDate) totalQuery = totalQuery.lte("date", filters.endDate);
    if (filters.categories?.length) totalQuery = totalQuery.in("category", filters.categories);
    if (typeof filters.minAmount === "number") totalQuery = totalQuery.gte("amount", filters.minAmount);
    if (typeof filters.maxAmount === "number") totalQuery = totalQuery.lte("amount", filters.maxAmount);
    if (filters.search) totalQuery = totalQuery.ilike("note", `%${filters.search}%`);

    const { data: totalRows } = await totalQuery;
    const totalSpent = (totalRows || []).reduce((sum, row) => sum + Number(row.amount), 0);

    return NextResponse.json({
      expenses: normalized,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.max(Math.ceil((count || 0) / limit), 1),
        hasMore: from + limit < (count || 0),
        totalSpent
      }
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
  const ids = request.nextUrl.searchParams
    .get("ids")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const targetIds = ids?.length ? ids : id ? [id] : [];

  if (!targetIds.length) {
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

    const { error } = await supabase.from("expenses").delete().in("id", targetIds).eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const stats = await calculateUpdatedStats(user.id, supabase);

    return NextResponse.json({ success: true, stats, deletedIds: targetIds });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete expense." },
      { status: 500 }
    );
  }
}
