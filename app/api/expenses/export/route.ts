import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { FALLBACK_EXPENSES, applyExpenseFilters, normalizeExpense, type ExpenseQueryFilters } from "@/lib/utils/expenses";

function parseFilters(request: NextRequest): ExpenseQueryFilters {
  const categories = request.nextUrl.searchParams
    .get("categories")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    startDate: request.nextUrl.searchParams.get("startDate") || undefined,
    endDate: request.nextUrl.searchParams.get("endDate") || undefined,
    categories: categories?.length ? categories : undefined,
    minAmount: request.nextUrl.searchParams.get("minAmount")
      ? Number(request.nextUrl.searchParams.get("minAmount"))
      : undefined,
    maxAmount: request.nextUrl.searchParams.get("maxAmount")
      ? Number(request.nextUrl.searchParams.get("maxAmount"))
      : undefined,
    search: request.nextUrl.searchParams.get("search") || undefined
  };
}

export async function GET(request: NextRequest) {
  const filters = parseFilters(request);

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    let expenses = FALLBACK_EXPENSES;

    if (user) {
      let query = supabase
        .from("expenses")
        .select("id, amount, category, note, date, created_at")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (filters.startDate) query = query.gte("date", filters.startDate);
      if (filters.endDate) query = query.lte("date", filters.endDate);
      if (filters.categories?.length) query = query.in("category", filters.categories);
      if (typeof filters.minAmount === "number") query = query.gte("amount", filters.minAmount);
      if (typeof filters.maxAmount === "number") query = query.lte("amount", filters.maxAmount);
      if (filters.search) query = query.ilike("note", `%${filters.search}%`);

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      expenses = (data || []).map((expense) => normalizeExpense(expense));
    } else {
      expenses = applyExpenseFilters(FALLBACK_EXPENSES, filters);
    }

    const csv = Papa.unparse(
      expenses.map((expense) => ({
        Date: expense.date,
        Category: expense.category,
        Note: expense.note || "",
        Amount: expense.amount
      }))
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pocketsense-expenses.csv"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export expenses." },
      { status: 500 }
    );
  }
}
