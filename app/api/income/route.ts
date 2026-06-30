import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/middleware/auth";
import { getSafeErrorMessage } from "@/lib/security/errors";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import {
  type IncomeRecord,
  INCOME_SOURCES,
  buildTuitionTracker,
  calculateTotalIncome,
  getIncomeBySource,
  predictNextIncome
} from "@/lib/utils/income";
import { isValidDateString, parsePositiveAmount, sanitizeNote } from "@/lib/utils/sanitize";

const incomeSchema = z.object({
  amount: z.union([z.number(), z.string()]).transform((value) => parsePositiveAmount(value)).refine(
    (value): value is number => value !== null,
    { message: "Amount must be greater than zero." }
  ),
  source: z.enum(Object.keys(INCOME_SOURCES) as [keyof typeof INCOME_SOURCES, ...Array<keyof typeof INCOME_SOURCES>]),
  date: z.string().refine((value) => isValidDateString(value), {
    message: "Date is required."
  }),
  note: z.union([z.string(), z.null(), z.undefined()]).transform((value) => sanitizeNote(value ?? "", 280)).optional(),
  is_recurring: z.boolean().optional()
});

function normalizeIncomeRows(rows: Array<Record<string, unknown>> = []): IncomeRecord[] {
  return rows.map((row) => ({
    id: String(row.id),
    amount: Number(row.amount),
    source: String(row.source),
    date: String(row.date),
    note: typeof row.note === "string" ? row.note : null,
    is_recurring: Boolean(row.is_recurring),
    created_at: String(row.created_at)
  }));
}

function buildIncomeResponse(incomes: IncomeRecord[]) {
  const recurring = incomes.filter((income) => income.is_recurring);
  const totalThisMonth = calculateTotalIncome(incomes);
  const sourceBreakdown = Object.keys(INCOME_SOURCES).map((source) => ({
    source,
    amount: getIncomeBySource(incomes, source),
    ...INCOME_SOURCES[source as keyof typeof INCOME_SOURCES]
  }));

  return {
    incomes,
    summary: {
      totalThisMonth,
      sourceBreakdown,
      recurringPredictions: predictNextIncome(recurring),
      tuitionTracker: buildTuitionTracker(incomes)
    }
  };
}

async function fetchUserIncomes(
  userId: string,
  request: NextRequest,
  supabase: ReturnType<typeof createRouteHandlerClient>
) {
  const startDate = request.nextUrl.searchParams.get("startDate");
  const endDate = request.nextUrl.searchParams.get("endDate");

  let query = supabase
    .from("incomes")
    .select("id, amount, source, date, note, is_recurring, created_at")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (startDate) {
    query = query.gte("date", startDate);
  }

  if (endDate) {
    query = query.lte("date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return normalizeIncomeRows(data || []);
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "income-list",
      limit: 120,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const incomes = await fetchUserIncomes(auth.user.id, request, auth.supabase);
    return NextResponse.json(buildIncomeResponse(incomes));
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to fetch incomes.") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = incomeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid income data." },
      { status: 400 }
    );
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "income-create",
      limit: 30,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;
    const { data, error } = await supabase
      .from("incomes")
      .insert({
        amount: parsed.data.amount,
        source: parsed.data.source,
        date: parsed.data.date,
        note: parsed.data.note || null,
        is_recurring: parsed.data.is_recurring || false,
        user_id: user.id
      })
      .select("id, amount, source, date, note, is_recurring, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: "Could not create income." }, { status: 400 });
    }

    const latestIncomes = await fetchUserIncomes(user.id, new NextRequest(request.url), supabase);

    return NextResponse.json({
      income: normalizeIncomeRows([data])[0],
      summary: buildIncomeResponse(latestIncomes).summary
    });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to create income.") },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body.id !== "string") {
    return NextResponse.json({ error: "Income id is required." }, { status: 400 });
  }

  const parsed = incomeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid income data." },
      { status: 400 }
    );
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "income-update",
      limit: 30,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("incomes")
      .update({
        amount: parsed.data.amount,
        source: parsed.data.source,
        date: parsed.data.date,
        note: parsed.data.note || null,
        is_recurring: parsed.data.is_recurring || false
      })
      .eq("id", body.id)
      .eq("user_id", user.id)
      .select("id, amount, source, date, note, is_recurring, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: "Could not update income." }, { status: 400 });
    }

    const latestIncomes = await fetchUserIncomes(user.id, new NextRequest(request.url), supabase);

    return NextResponse.json({
      income: normalizeIncomeRows([data])[0],
      summary: buildIncomeResponse(latestIncomes).summary
    });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to update income.") },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Income id is required." }, { status: 400 });
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "income-delete",
      limit: 30,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const { error } = await supabase.from("incomes").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Could not delete income." }, { status: 400 });
    }

    const latestIncomes = await fetchUserIncomes(user.id, new NextRequest(request.url), supabase);

    return NextResponse.json({ success: true, summary: buildIncomeResponse(latestIncomes).summary });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to delete income.") },
      { status: 500 }
    );
  }
}

