"use client";

import { createClient } from "@/lib/supabase/client";

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  return {
    success: !error,
    error: error?.message
  };
}
