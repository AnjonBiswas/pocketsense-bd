"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type SessionResponse = {
  authenticated: boolean;
  onboardingCompleted: boolean;
};

export function DashboardSessionGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const response = await fetch("/api/auth/session", {
        credentials: "same-origin",
        cache: "no-store"
      }).catch(() => null);

      if (!response || cancelled) {
        return;
      }

      const data = (await response.json().catch(() => null)) as SessionResponse | null;

      if (!data?.authenticated) {
        router.replace("/auth/login");
        return;
      }

      if (pathname.startsWith("/dashboard") && !data.onboardingCompleted) {
        router.replace("/onboarding");
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}

