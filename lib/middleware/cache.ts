import { NextResponse, type NextRequest } from "next/server";

type CacheOptions = {
  maxAge?: number;
  staleWhileRevalidate?: number;
  isPrivate?: boolean;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function applyCacheHeaders(response: NextResponse, options: CacheOptions = {}) {
  const {
    maxAge = 30,
    staleWhileRevalidate = 120,
    isPrivate = true
  } = options;
  const visibility = isPrivate ? "private" : "public";

  response.headers.set(
    "Cache-Control",
    `${visibility}, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );

  return response;
}

export function enforceRateLimit(request: NextRequest, options: RateLimitOptions) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "local";
  const bucketKey = `${options.key}:${ip}`;
  const now = Date.now();
  const current = rateLimitStore.get(bucketKey);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs
    });
    return null;
  }

  if (current.count >= options.limit) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((current.resetAt - now) / 1000))
        }
      }
    );
  }

  current.count += 1;
  rateLimitStore.set(bucketKey, current);
  return null;
}
