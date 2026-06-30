import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        onboardingCompleted: false
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      authenticated: true,
      onboardingCompleted: Boolean(profile?.onboarding_completed)
    });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        onboardingCompleted: false,
        error: error instanceof Error ? error.message : "Failed to load session."
      },
      { status: 500 }
    );
  }
}

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
