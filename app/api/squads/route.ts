import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/middleware/auth";
import { getSafeErrorMessage } from "@/lib/security/errors";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { calculateSettlements } from "@/lib/utils/splitCalculator";
import {
  applySettlementHistory,
  mapExpensesForSettlementCalculation,
  normalizeSquad,
  normalizeSquadExpense,
  normalizeSquadSettlement,
  type SquadCardSummary
} from "@/lib/utils/squads";

async function buildSquadSummaries(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  userId: string
): Promise<SquadCardSummary[]> {
  const [{ data: owned }, { data: memberOf }] = await Promise.all([
    supabase.from("squads").select("id, name, created_by, members, created_at").eq("created_by", userId),
    supabase.from("squads").select("id, name, created_by, members, created_at").contains("members", [userId])
  ]);

  const squadMap = new Map<string, ReturnType<typeof normalizeSquad>>();
  [...(owned || []), ...(memberOf || [])].forEach((row) => {
    const normalized = normalizeSquad(row);
    squadMap.set(normalized.id, normalized);
  });

  const squads = [...squadMap.values()];
  if (!squads.length) return [];

  const memberIds = [...new Set(squads.flatMap((squad) => squad.members))];
  const squadIds = squads.map((squad) => squad.id);

  const [{ data: profiles }, { data: expenses }, { data: settlements }] = await Promise.all([
    supabase.from("profiles").select("id, name, phone, avatar_url").in("id", memberIds),
    supabase
      .from("squad_expenses")
      .select("id, squad_id, amount, description, paid_by, split_among, split_type, custom_split, date, created_at")
      .in("squad_id", squadIds),
    supabase
      .from("squad_settlements")
      .select("id, squad_id, from_user_id, to_user_id, amount, note, status, created_at, settled_at")
      .in("squad_id", squadIds)
  ]);

  return squads.map((squad) => {
    const squadMembers = (profiles || []).filter((profile) => squad.members.includes(profile.id));
    const squadExpenses = (expenses || [])
      .filter((expense) => expense.squad_id === squad.id)
      .map((expense) => normalizeSquadExpense(expense));
    const squadHistory = (settlements || [])
      .filter((item) => item.squad_id === squad.id)
      .map((item) => normalizeSquadSettlement(item));
    const pendingSettlements = applySettlementHistory(
      calculateSettlements(mapExpensesForSettlementCalculation(squadExpenses)),
      squadHistory
    );
    const lastActivity =
      squadExpenses.sort((left, right) => right.created_at.localeCompare(left.created_at))[0]?.created_at ||
      squad.created_at;

    return {
      squad,
      members: squadMembers,
      pendingSettlements,
      lastActivity
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "squads-list",
      limit: 60,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;
    const squads = await buildSquadSummaries(supabase, user.id);
    return NextResponse.json({ squads, currentUserId: user.id });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to load squads.") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { name?: string; memberIds?: string[] }
    | null;

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Squad name is required." }, { status: 400 });
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "squads-create",
      limit: 20,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const members = [...new Set([user.id, ...(body.memberIds || [])])];
    const { data, error } = await supabase
      .from("squads")
      .insert({
        name: body.name.trim(),
        created_by: user.id,
        members
      })
      .select("id, name, created_by, members, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ squad: normalizeSquad(data) });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to create squad.") },
      { status: 500 }
    );
  }
}
