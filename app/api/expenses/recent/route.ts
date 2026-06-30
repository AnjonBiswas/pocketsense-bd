import { NextRequest, NextResponse } from "next/server";
import { applyCacheHeaders } from "@/lib/middleware/cache";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { getCategoryMeta } from "@/lib/utils/categories";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.max(Number(limitParam || 5), 1);

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return applyCacheHeaders(NextResponse.json([]), { maxAge: 60, staleWhileRevalidate: 300, isPrivate: false });
    }

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
  } catch {
    const supabase = createRouteHandlerClient();
    const authResult = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (authResult.data.user) {
      return applyCacheHeaders(NextResponse.json([]), { maxAge: 30, staleWhileRevalidate: 120, isPrivate: false });
    }

    return applyCacheHeaders(NextResponse.json([]), { maxAge: 30, staleWhileRevalidate: 120, isPrivate: false });
  }
}
