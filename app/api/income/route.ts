import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import {
  type IncomeRecord,
  INCOME_SOURCES,
  buildTuitionTracker,
  calculateTotalIncome,
  getIncomeBySource,
  predictNextIncome
} from "@/lib/utils/income";

const VALID_SOURCES = new Set(Object.keys(INCOME_SOURCES));

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

function buildGuestIncomes(): IncomeRecord[] {
  const today = new Date();
  const month = today.toISOString().slice(0, 7);

  return [
    {
      id: "guest-income-1",
      amount: 6000,
      source: "allowance",
      date: `${month}-02`,
      note: "Monthly allowance",
      is_recurring: true,
      created_at: today.toISOString()
    },
    {
      id: "guest-income-2",
      amount: 4500,
      source: "tuition",
      date: `${month}-10`,
      note: "Student: Arafat",
      is_recurring: true,
      created_at: today.toISOString()
    },
    {
      id: "guest-income-3",
      amount: 3200,
      source: "freelance",
      date: `${month}-18`,
      note: "Landing page fix",
      is_recurring: false,
      created_at: today.toISOString()
    }
  ];
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

function validateIncomePayload(body: Record<string, unknown>) {
  const amount = Number(body.amount);
  const source = typeof body.source === "string" ? body.source : "";
  const date = typeof body.date === "string" ? body.date : "";
  const note = typeof body.note === "string" ? body.note.trim() : null;
  const is_recurring = Boolean(body.is_recurring);

  if (!amount || amount <= 0) {
    return { error: "Amount must be greater than zero." };
  }

  if (!VALID_SOURCES.has(source)) {
    return { error: "Invalid income source." };
  }

  if (!date) {
    return { error: "Date is required." };
  }

  return {
    value: {
      amount,
      source,
      date,
      note,
      is_recurring
    }
  };
}

async function fetchUserIncomes(userId: string, request: NextRequest, supabase: ReturnType<typeof createRouteHandlerClient>) {
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
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(buildIncomeResponse(buildGuestIncomes()));
    }

    const incomes = await fetchUserIncomes(user.id, request, supabase);
    return NextResponse.json(buildIncomeResponse(incomes));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch incomes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateIncomePayload(body);

  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const income = {
        id: `guest-income-${Date.now()}`,
        ...validation.value,
        created_at: new Date().toISOString()
      };

      return NextResponse.json({ income, summary: buildIncomeResponse([...buildGuestIncomes(), income]).summary });
    }

    const { data, error } = await supabase
      .from("incomes")
      .insert({
        ...validation.value,
        user_id: user.id
      })
      .select("id, amount, source, date, note, is_recurring, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const latestIncomes = await fetchUserIncomes(user.id, new NextRequest(request.url), supabase);

    return NextResponse.json({
      income: normalizeIncomeRows([data])[0],
      summary: buildIncomeResponse(latestIncomes).summary
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create income." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body.id !== "string") {
    return NextResponse.json({ error: "Income id is required." }, { status: 400 });
  }

  const validation = validateIncomePayload(body);

  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const { data, error } = await supabase
      .from("incomes")
      .update(validation.value)
      .eq("id", body.id)
      .eq("user_id", user.id)
      .select("id, amount, source, date, note, is_recurring, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const latestIncomes = await fetchUserIncomes(user.id, new NextRequest(request.url), supabase);

    return NextResponse.json({
      income: normalizeIncomeRows([data])[0],
      summary: buildIncomeResponse(latestIncomes).summary
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update income." },
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
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from("incomes").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const latestIncomes = await fetchUserIncomes(user.id, new NextRequest(request.url), supabase);

    return NextResponse.json({ success: true, summary: buildIncomeResponse(latestIncomes).summary });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete income." },
      { status: 500 }
    );
  }
}
