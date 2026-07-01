"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertBanner } from "@/components/notifications/AlertBanner";
import { SOSMode } from "@/components/features/SOSMode";
import { SOSModeActive } from "@/components/features/SOSModeActive";
import { useExpenseStore } from "@/store/expenseStore";
import { useDashboardStore } from "@/store/dashboardStore";

export function DashboardEmergencyShell() {
  const dashboardStats = useDashboardStore((store) => store.stats);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const showToast = useExpenseStore((store) => store.showToast);

  const state = dashboardStats?.sos ?? null;

  useEffect(() => {
    if (!state?.periodKey || typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(`pocketsense-sos-dismissed:${state.periodKey}`);
    setDismissedKey(stored === "1" ? state.periodKey : null);
  }, [state?.periodKey]);

  const isModalSuppressed = useMemo(() => {
    if (!state?.periodKey) {
      return false;
    }

    return dismissedKey === state.periodKey;
  }, [dismissedKey, state?.periodKey]);

  function dismissForPeriod() {
    if (!state?.periodKey || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(`pocketsense-sos-dismissed:${state.periodKey}`, "1");
    setDismissedKey(state.periodKey);
  }

  async function deactivateSOSMode() {
    const response = await fetch("/api/sos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "deactivate"
      })
    });

    if (!response.ok) {
      showToast({
        type: "error",
        message: "Could not deactivate survival mode right now."
      });
      return;
    }

    showToast({
      type: "success",
      message: "Survival mode updated."
    });
    dismissForPeriod();
  }

  async function refreshAfterActivation() {
    showToast({
      type: "success",
      message: "Survival mode activated. Your budget is protected."
    });
    dismissForPeriod();
  }

  if (!state) {
    return null;
  }

  const showCriticalModal =
    Boolean(state?.shouldActivate) && state?.severity === "critical" && !isModalSuppressed;
  const showWarningBanner =
    Boolean(state?.shouldActivate) && state?.severity === "warning" && !isModalSuppressed;

  return (
    <>
      {state?.isActive ? <SOSModeActive state={state} onDeactivate={deactivateSOSMode} /> : null}
      {showWarningBanner ? (
        <AlertBanner
          type="warning"
          title="Emergency budget alert"
          message="Your budget is tight for this period. Survival Mode is available if you want to protect the month-end balance."
        />
      ) : null}
      {showCriticalModal ? (
        <SOSMode state={state} onActivated={refreshAfterActivation} onDismiss={dismissForPeriod} />
      ) : null}
    </>
  );
}
