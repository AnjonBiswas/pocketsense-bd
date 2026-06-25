import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { getFallbackSquadMembers } from "@/lib/utils/squads";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({ members: [] });
  }

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const fallback = getFallbackSquadMembers().filter(
        (member) => member.phone?.includes(query) || member.name?.toLowerCase().includes(query.toLowerCase())
      );
      return NextResponse.json({ members: fallback });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, phone, avatar_url")
      .or(`phone.ilike.%${query}%,name.ilike.%${query}%`)
      .neq("id", user.id)
      .limit(8);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ members: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search members." },
      { status: 500 }
    );
  }
}

