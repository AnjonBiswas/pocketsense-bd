import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/middleware/auth";
import { getSafeErrorMessage } from "@/lib/security/errors";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({ members: [] });
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "squad-member-search",
      limit: 60,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

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
      { error: getSafeErrorMessage(error, "Failed to search members.") },
      { status: 500 }
    );
  }
}
