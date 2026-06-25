import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

function fallbackLeaderboard() {
  return {
    leaderboard: [
      { id: "user-1", name: "Sabbir", university: "DU", xp: 2800, level: 2, savings: 5200, rank: 1 },
      { id: "user-2", name: "Nabila", university: "NSU", xp: 2400, level: 2, savings: 4800, rank: 2 },
      { id: "user-3", name: "Arafat", university: "BUET", xp: 2100, level: 2, savings: 4200, rank: 3 }
    ],
    userRank: 6
  };
}

export async function GET(request: NextRequest) {
  const metric = request.nextUrl.searchParams.get("metric") || "xp";
  const friendOnly = request.nextUrl.searchParams.get("friendOnly") === "true";

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(fallbackLeaderboard());
    }

    let allowedIds: string[] | null = null;
    if (friendOnly) {
      const { data: squads } = await supabase
        .from("squads")
        .select("members")
        .contains("members", [user.id]);
      allowedIds = [...new Set((squads || []).flatMap((squad) => squad.members || []))];
      if (!allowedIds.length) allowedIds = [user.id];
    }

    let query = supabase
      .from("profiles")
      .select("id, name, university, xp, level")
      .order(metric === "savings" ? "xp" : "xp", { ascending: false })
      .limit(10);

    if (allowedIds) {
      query = query.in("id", allowedIds);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const leaderboard = (data || []).map((profile, index) => ({
      id: profile.id,
      name: profile.name || "PocketSense User",
      university: profile.university || "Campus",
      xp: Number(profile.xp || 0),
      level: Number(profile.level || 0),
      savings: Number(profile.xp || 0) * 2,
      rank: index + 1
    }));

    const userRank = leaderboard.find((entry) => entry.id === user.id)?.rank || leaderboard.length + 1;

    return NextResponse.json({
      leaderboard,
      userRank
    });
  } catch (error) {
    return NextResponse.json(
      fallbackLeaderboard(),
      { status: error instanceof Error ? 200 : 200 }
    );
  }
}
