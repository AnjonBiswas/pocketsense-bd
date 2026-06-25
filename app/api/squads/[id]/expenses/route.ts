import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { calculateSplits, calculateSettlements } from "@/lib/utils/splitCalculator";
import {
  applySettlementHistory,
  getFallbackSettlementHistory,
  getFallbackSquadExpenses,
  getFallbackSquadMembers,
  getFallbackSquads,
  mapExpensesForSettlementCalculation,
  normalizeSquad,
  normalizeSquadExpense,
  normalizeSquadSettlement
} from "@/lib/utils/squads";

async function buildSquadDetails(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  squadId: string,
  currentUserId: string
) {
  const { data: squadData, error: squadError } = await supabase
    .from("squads")
    .select("id, name, created_by, members, created_at")
    .eq("id", squadId)
    .single();

  if (squadError || !squadData) {
    throw new Error(squadError?.message || "Squad not found.");
  }

  const squad = normalizeSquad(squadData);
  const memberIds = squad.members;

  const [{ data: profiles }, { data: expenses }, { data: settlements }] = await Promise.all([
    supabase.from("profiles").select("id, name, phone, avatar_url").in("id", memberIds),
    supabase
      .from("squad_expenses")
      .select("id, squad_id, amount, description, paid_by, split_among, split_type, custom_split, date, created_at")
      .eq("squad_id", squad.id)
      .order("date", { ascending: false }),
    supabase
      .from("squad_settlements")
      .select("id, squad_id, from_user_id, to_user_id, amount, note, status, created_at, settled_at")
      .eq("squad_id", squad.id)
      .order("created_at", { ascending: false })
  ]);

  const normalizedExpenses = (expenses || []).map((expense) => normalizeSquadExpense(expense));
  const settlementHistory = (settlements || []).map((item) => normalizeSquadSettlement(item));
  const settlementsSummary = applySettlementHistory(
    calculateSettlements(mapExpensesForSettlementCalculation(normalizedExpenses)),
    settlementHistory
  );

  return {
    squad,
    members: profiles || [],
    expenses: normalizedExpenses,
    settlements: settlementsSummary,
    settlementHistory,
    currentUserId
  };
}

function getFallbackDetails(squadId: string) {
  const squad = getFallbackSquads().find((item) => item.id === squadId) || getFallbackSquads()[0];
  const expenses = getFallbackSquadExpenses().filter((expense) => expense.squad_id === squad.id);
  const history = getFallbackSettlementHistory().filter((item) => item.squad_id === squad.id);

  return {
    squad,
    members: getFallbackSquadMembers().filter((member) => squad.members.includes(member.id)),
    expenses,
    settlements: applySettlementHistory(calculateSettlements(mapExpensesForSettlementCalculation(expenses)), history),
    settlementHistory: history,
    currentUserId: "user-demo-1"
  };
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(getFallbackDetails(params.id));
    }

    const details = await buildSquadDetails(supabase, params.id, user.id);
    return NextResponse.json(details);
  } catch {
    return NextResponse.json(getFallbackDetails(params.id));
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => null)) as
    | {
        amount?: number;
        description?: string;
        paidBy?: string;
        splitAmong?: string[];
        splitType?: "equal" | "custom";
        customAmounts?: Record<string, number>;
        date?: string;
      }
    | null;

  if (!body?.amount || !body?.description?.trim() || !body?.paidBy || !body?.splitAmong?.length) {
    return NextResponse.json({ error: "Missing squad expense fields." }, { status: 400 });
  }

  try {
    calculateSplits(
      Number(body.amount),
      body.paidBy,
      body.splitAmong,
      body.splitType || "equal",
      body.customAmounts
    );

    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ expense: null, fallback: true });
    }

    const { data, error } = await supabase
      .from("squad_expenses")
      .insert({
        squad_id: params.id,
        amount: Number(body.amount),
        description: body.description.trim(),
        paid_by: body.paidBy,
        split_among: body.splitAmong,
        split_type: body.splitType || "equal",
        custom_split: body.splitType === "custom" ? body.customAmounts || {} : null,
        date: body.date || new Date().toISOString().slice(0, 10)
      })
      .select("id, squad_id, amount, description, paid_by, split_among, split_type, custom_split, date, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const details = await buildSquadDetails(supabase, params.id, user.id);
    return NextResponse.json({
      expense: normalizeSquadExpense(data),
      settlements: details.settlements,
      settlementHistory: details.settlementHistory
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add squad expense." },
      { status: 500 }
    );
  }
}

