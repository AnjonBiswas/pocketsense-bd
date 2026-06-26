import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/server";

const PUBLIC_PATHS = ["/", "/privacy-policy", "/terms-of-service"];
const AUTH_PATHS = ["/auth/login", "/auth/signup"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname.includes(".")
  ) {
    return response;
  }

  const supabase = createMiddlewareClient(request, response);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith("/dashboard") || pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const onboardingCompleted = Boolean(profile?.onboarding_completed);

  if (AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(onboardingCompleted ? "/dashboard" : "/onboarding", request.url));
  }

  if (!onboardingCompleted && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (onboardingCompleted && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (PUBLIC_PATHS.includes(pathname) || AUTH_PATHS.includes(pathname)) {
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
