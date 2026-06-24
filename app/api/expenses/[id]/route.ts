import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { normalizeExpense } from "@/lib/utils/expenses";
import { CATEGORIES } from "@/lib/utils/categories";

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

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("expenses")
      .select("id, amount, category, note, date, created_at")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ expense: normalizeExpense(data) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch expense." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("expenses")
      .update(validation.value)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("id, amount, category, note, date, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ expense: normalizeExpense(data) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update expense." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { error } = await supabase.from("expenses").delete().eq("id", params.id).eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete expense." },
      { status: 500 }
    );
  }
}

