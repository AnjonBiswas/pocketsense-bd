"use client";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

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
  const supabase = createClient();
  await clearServerSession();
  await supabase.auth.signOut({ scope: "local" }).catch(() => null);
  clearStoredSupabaseSession();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (!error && data.user) {
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
  const supabase = createClient();
  await clearServerSession();
  await supabase.auth.signOut({ scope: "local" }).catch(() => null);
  clearStoredSupabaseSession();

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
  const supabase = createClient();
  await clearServerSession();
  await supabase.auth.signOut({ scope: "local" }).catch(() => null);
  clearStoredSupabaseSession();

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
  const { error } = await supabase.auth.signOut({ scope: "local" });
  await clearServerSession();
  clearStoredSupabaseSession();

  return {
    success: !error,
    error: error?.message
  };
}
