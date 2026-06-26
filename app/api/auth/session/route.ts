import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createRouteHandlerClient();
    await supabase.auth.signOut({ scope: "local" });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to clear session."
      },
      { status: 500 }
    );
  }
}
