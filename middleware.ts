import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/privacy-policy", "/terms-of-service"];
const AUTH_PATHS = ["/auth/login", "/auth/signup"];

function hasSupabaseSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

function buildContentSecurityPolicy() {
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = isDev
    ? ["'self'", "'unsafe-eval'", "'unsafe-inline'"]
    : ["'self'", "'unsafe-inline'"];

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://*.supabase.co",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'"
  ].join("; ");
}

function applySecurityHeaders(request: NextRequest, response: NextResponse) {
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (request.nextUrl.pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    const allowedOrigin = request.nextUrl.origin;
    const corsOrigin = origin === allowedOrigin ? origin : allowedOrigin;

    response.headers.set("Access-Control-Allow-Origin", corsOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, X-CSRF-Token"
    );
    response.headers.set("Vary", "Origin");
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname.includes(".")
  ) {
    if (pathname.startsWith("/api") && request.method === "OPTIONS") {
      return applySecurityHeaders(request, new NextResponse(null, { status: 204 }));
    }

    return applySecurityHeaders(request, response);
  }

  const hasSession = hasSupabaseSessionCookie(request);

  if (!hasSession) {
    if (pathname.startsWith("/dashboard") || pathname === "/onboarding") {
      return applySecurityHeaders(request, NextResponse.redirect(new URL("/auth/login", request.url)));
    }

    return applySecurityHeaders(request, response);
  }

  if (PUBLIC_PATHS.includes(pathname) || AUTH_PATHS.includes(pathname)) {
    return applySecurityHeaders(request, response);
  }

  return applySecurityHeaders(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
