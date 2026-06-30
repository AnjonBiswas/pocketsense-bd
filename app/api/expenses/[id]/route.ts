import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/middleware/auth";
import { getSafeErrorMessage } from "@/lib/security/errors";
import { normalizeExpense } from "@/lib/utils/expenses";
import { CATEGORIES } from "@/lib/utils/categories";
import { isValidDateString, parsePositiveAmount, sanitizeNote } from "@/lib/utils/sanitize";

const expenseCategoryKeys = Object.keys(CATEGORIES) as [
  keyof typeof CATEGORIES,
  ...Array<keyof typeof CATEGORIES>
];

const expenseSchema = z.object({
  amount: z.union([z.number(), z.string()]).transform((value) => parsePositiveAmount(value)).refine(
    (value): value is number => value !== null,
    { message: "Amount must be greater than zero." }
  ),
  category: z.enum(expenseCategoryKeys),
  note: z.union([z.string(), z.null(), z.undefined()]).transform((value) => sanitizeNote(value ?? "", 280)).optional(),
  date: z.string().refine((value) => isValidDateString(value), {
    message: "Date is required."
  })
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireApiUser(_request, {
      rateLimitKey: "expenses-single",
      limit: 120,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("expenses")
      .select("id, amount, category, note, date, created_at")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }

    return NextResponse.json({ expense: normalizeExpense(data) });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to fetch expense.") },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = expenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid expense data." },
      { status: 400 }
    );
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "expenses-update",
      limit: 30,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("expenses")
      .update({
        amount: parsed.data.amount,
        category: parsed.data.category,
        note: parsed.data.note || null,
        date: parsed.data.date
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("id, amount, category, note, date, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: "Could not update expense." }, { status: 400 });
    }

    return NextResponse.json({ expense: normalizeExpense(data) });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to update expense.") },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireApiUser(_request, {
      rateLimitKey: "expenses-delete-single",
      limit: 30,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const { error } = await supabase.from("expenses").delete().eq("id", params.id).eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Could not delete expense." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to delete expense.") },
      { status: 500 }
    );
  }
}
