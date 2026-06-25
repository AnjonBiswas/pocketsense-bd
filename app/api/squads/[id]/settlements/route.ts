import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { normalizeSquadSettlement } from "@/lib/utils/squads";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient();
    const { data, error } = await supabase
      .from("squad_settlements")
      .select("id, squad_id, from_user_id, to_user_id, amount, note, status, created_at, settled_at")
      .eq("squad_id", params.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ history: (data || []).map((item) => normalizeSquadSettlement(item)) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settlement history." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => null)) as
    | { fromUserId?: string; toUserId?: string; amount?: number; note?: string }
    | null;

  if (!body?.fromUserId || !body?.toUserId || !body.amount) {
    return NextResponse.json({ error: "Settlement details are required." }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient();
    const { data, error } = await supabase
      .from("squad_settlements")
      .insert({
        squad_id: params.id,
        from_user_id: body.fromUserId,
        to_user_id: body.toUserId,
        amount: Number(body.amount),
        note: body.note || "Marked as paid",
        status: "paid",
        settled_at: new Date().toISOString()
      })
      .select("id, squad_id, from_user_id, to_user_id, amount, note, status, created_at, settled_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ settlement: normalizeSquadSettlement(data) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark settlement as paid." },
      { status: 500 }
    );
  }
}

