"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES_TO_WARM = [
  "/dashboard/expenses",
  "/dashboard/income",
  "/dashboard/reports",
  "/dashboard/challenges",
  "/dashboard/squads",
  "/dashboard/settings"
] as const;

export function DashboardRouteWarmup() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const warm = () => {
      if (cancelled) {
        return;
      }

      for (const route of ROUTES_TO_WARM) {
        router.prefetch(route);
      }
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(warm);
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = globalThis.setTimeout(warm, 1200);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(timeoutId);
    };
  }, [router]);

  return null;
}
