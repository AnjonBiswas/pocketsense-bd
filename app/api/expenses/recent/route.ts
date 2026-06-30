import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/middleware/auth";
import { getSafeErrorMessage } from "@/lib/security/errors";
import { applyCacheHeaders } from "@/lib/middleware/cache";
import { getCategoryMeta } from "@/lib/utils/categories";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.max(Number(limitParam || 5), 1);

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "recent-expenses",
      limit: 90,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const { data: expenses } = await supabase
      .from("expenses")
      .select("id, amount, category, note, date, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    const payload = (expenses || []).map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
      categoryDetails: getCategoryMeta(expense.category),
      formattedDate: new Date(expense.date).toLocaleDateString("en-GB")
    }));

    return applyCacheHeaders(NextResponse.json(payload), { maxAge: 15, staleWhileRevalidate: 60 });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to fetch recent expenses.") },
      { status: 500 }
    );
  }
}
