import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { getCategoryMeta } from "@/lib/utils/categories";

const fallbackExpenses = [
  {
    id: "1",
    amount: 120,
    category: "food",
    note: "Lunch with classmates",
    date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    amount: 50,
    category: "cafe",
    note: "Milk tea",
    date: new Date().toISOString().slice(0, 10),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: "3",
    amount: 80,
    category: "transport",
    note: "Campus bus",
    date: new Date().toISOString().slice(0, 10),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  }
];

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.max(Number(limitParam || 5), 1);

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        fallbackExpenses.slice(0, limit).map((expense) => ({
          ...expense,
          categoryDetails: getCategoryMeta(expense.category)
        }))
      );
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

    return NextResponse.json(payload);
  } catch {
    const supabase = createRouteHandlerClient();
    const authResult = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (authResult.data.user) {
      return NextResponse.json([]);
    }

    return NextResponse.json(
      fallbackExpenses.slice(0, limit).map((expense) => ({
        ...expense,
        categoryDetails: getCategoryMeta(expense.category)
      }))
    );
  }
}
