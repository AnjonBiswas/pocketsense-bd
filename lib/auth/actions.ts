"use client";

import { createClient, resetBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

function clearSupabaseCookies() {
  if (typeof document === "undefined") {
    return;
  }

  try {
    const cookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.trim().split("=")[0])
      .filter((name) => name.startsWith("sb-"));

    for (const name of cookieNames) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
    }
  } catch {
    // Ignore cookie cleanup errors.
  }
}

function clearStoredSupabaseSession() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("sb-") && key.includes("auth-token")) {
        window.localStorage.removeItem(key);
      }
    }

    for (const key of Object.keys(window.sessionStorage)) {
      if (key.startsWith("sb-") && key.includes("auth-token")) {
        window.sessionStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore browser storage cleanup errors.
  }

  clearSupabaseCookies();
  resetBrowserClient();
}

async function clearServerSession() {
  if (typeof window === "undefined") {
    return;
  }

  await fetch("/api/auth/session", {
    method: "POST",
    credentials: "same-origin"
  }).catch(() => null);
}

async function resetAuthState() {
  await clearServerSession();

  const currentClient = createClient();
  await currentClient.auth.signOut().catch(() => null);
  await currentClient.auth.signOut({ scope: "global" }).catch(() => null);

  clearStoredSupabaseSession();
}

function markInstallPromptEligible() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = "pocketsense_install_prompt=1; path=/; max-age=900; samesite=lax";
  window.dispatchEvent(new Event("pocketsense-auth-success"));
}

async function ensureProfileForUser(
  supabase: ReturnType<typeof createClient>,
  user: { id: string; user_metadata?: { name?: unknown } | null },
  fallbackName?: string
) {
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, onboarding_completed, onboarding_step")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return {
      onboardingCompleted: Boolean(existingProfile.onboarding_completed),
      onboardingStep: Number(existingProfile.onboarding_step || 1)
    };
  }

  const payload = {
    id: user.id,
    name:
      fallbackName?.trim() ||
      (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null),
    onboarding_completed: false,
    onboarding_step: 1
  } satisfies Database["public"]["Tables"]["profiles"]["Insert"];

  await supabase.from("profiles").insert(payload);

  return {
    onboardingCompleted: false,
    onboardingStep: 1
  };
}

export async function signInWithEmail(email: string, password: string) {
  await resetAuthState();
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (!error && data.user) {
    const signedInEmail = data.user.email?.trim().toLowerCase();
    if (signedInEmail && signedInEmail !== email.trim().toLowerCase()) {
      await supabase.auth.signOut().catch(() => null);
      clearStoredSupabaseSession();

      return {
        success: false,
        user: null,
        session: null,
        onboardingCompleted: false,
        onboardingStep: 1,
        error: "Session mismatch detected. Please try logging in again."
      };
    }

    markInstallPromptEligible();
    const profileState = await ensureProfileForUser(supabase, data.user);

    return {
      success: true,
      user: data.user,
      session: data.session,
      onboardingCompleted: profileState.onboardingCompleted,
      onboardingStep: profileState.onboardingStep,
      error: undefined
    };
  }

  return {
    success: false,
    user: data.user,
    session: data.session,
    onboardingCompleted: false,
    onboardingStep: 1,
    error: error?.message
  };
}

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  name?: string;
}) {
  await resetAuthState();
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: {
        name: params.name?.trim() || null
      }
    }
  });

  if (error) {
    return {
      success: false,
      user: null,
      session: null,
      requiresEmailConfirmation: false,
      error: error.message
    };
  }

  if (data.user && data.session) {
    const signedUpEmail = data.user.email?.trim().toLowerCase();
    if (signedUpEmail && signedUpEmail !== params.email.trim().toLowerCase()) {
      await supabase.auth.signOut().catch(() => null);
      clearStoredSupabaseSession();

      return {
        success: false,
        user: null,
        session: null,
        requiresEmailConfirmation: false,
        error: "Session mismatch detected. Please try signing up again."
      };
    }

    markInstallPromptEligible();
    const profileState = await ensureProfileForUser(supabase, data.user, params.name);

    return {
      success: true,
      user: data.user,
      session: data.session,
      onboardingCompleted: profileState.onboardingCompleted,
      onboardingStep: profileState.onboardingStep,
      requiresEmailConfirmation: false,
      error: undefined
    };
  }

  return {
    success: true,
    user: data.user,
    session: data.session,
    onboardingCompleted: false,
    onboardingStep: 1,
    requiresEmailConfirmation: !data.session,
    error: undefined
  };
}

export async function updatePassword(password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  return {
    success: !error,
    error: error?.message
  };
}

export async function updateEmail(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ email: email.trim() });

  return {
    success: !error,
    error: error?.message
  };
}

export async function signInWithGoogle() {
  await resetAuthState();
  const supabase = createClient();

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo
    }
  });

  return {
    success: !error,
    url: data.url,
    error: error?.message
  };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  await supabase.auth.signOut({ scope: "global" }).catch(() => null);
  await clearServerSession();
  clearStoredSupabaseSession();

  return {
    success: !error,
    error: error?.message
  };
}
