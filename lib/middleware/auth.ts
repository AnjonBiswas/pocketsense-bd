import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { enforceRateLimitByScope } from "@/lib/middleware/cache";

type ApiAuthOptions = {
  rateLimitKey: string;
  limit?: number;
  windowMs?: number;
};

export async function requireApiUser(request: NextRequest, options: ApiAuthOptions) {
  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        supabase,
        error: NextResponse.json({ error: "Authentication required." }, { status: 401 })
      };
    }

    const rateLimited = enforceRateLimitByScope(user.id, {
      key: options.rateLimitKey,
      limit: options.limit ?? 60,
      windowMs: options.windowMs ?? 60_000
    });

    if (rateLimited) {
      return {
        supabase,
        user,
        error: rateLimited
      };
    }

    return {
      supabase,
      user,
      error: null
    };
  } catch {
    return {
      error: NextResponse.json({ error: "Unable to verify your session right now." }, { status: 500 })
    };
  }
}
