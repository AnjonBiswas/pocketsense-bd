import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const supabase = createRouteHandlerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/auth/login?error=oauth_callback", request.url));
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    let redirectPath = "/onboarding";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          name:
            typeof user.user_metadata?.name === "string"
              ? user.user_metadata.name
              : null,
          onboarding_completed: false,
          onboarding_step: 1
        });
      } else if (profile.onboarding_completed) {
        redirectPath = next && next.startsWith("/") ? next : "/dashboard";
      }
    }

    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    response.cookies.set("pocketsense_install_prompt", "1", {
      path: "/",
      maxAge: 900,
      sameSite: "lax"
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/auth/login?error=oauth_callback", request.url));
  }
}
