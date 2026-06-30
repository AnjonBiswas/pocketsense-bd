import "server-only";

import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3000/api"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required."),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");

  throw new Error(`Environment validation failed: ${message}`);
}

export const env = parsedEnv.data;

export function isPublicPlaceholder(value?: string | null) {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith("your_") ||
    normalized.includes("your-project-ref") ||
    normalized.includes("placeholder") ||
    normalized.includes("example")
  );
}

export function validatePublicRuntimeEnv() {
  if (isPublicPlaceholder(env.NEXT_PUBLIC_SUPABASE_URL)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be configured before running the app.");
  }

  if (isPublicPlaceholder(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured before running the app.");
  }
}

