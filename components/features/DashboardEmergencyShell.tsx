"use client";

import { useEffect, useState, useTransition } from "react";
import { SOSMode } from "@/components/features/SOSMode";
import { SOSModeActive } from "@/components/features/SOSModeActive";
import { useExpenseStore } from "@/store/expenseStore";

type SOSPayload = {
  shouldActivate: boolean;
  severity: "warning" | "critical";
  isActive: boolean;
  remainingBudget: number;
  daysRemaining: number;
  dailyBudget: number;
  activatedTips: string[];
  projectedSavings: number;
  canSurvive: boolean;
  survivalTarget: number;
  hasLockedFunds: boolean;
  lockedAmount: number;
  hasPin: boolean;
  complianceScore: number;
  luxuryWarning: string | null;
};

export function DashboardEmergencyShell() {
  const [state, setState] = useState<SOSPayload | null>(null);
  const [isPending, startTransition] = useTransition();
  const showToast = useExpenseStore((store) => store.showToast);

  const load = () => {
    startTransition(async () => {
      const response = await fetch("/api/sos", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        return;
      }

      setState(payload);
    });
  };

  useEffect(() => {
    load();
  }, []);

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
    load();
  }

  async function refreshAfterActivation() {
    showToast({
      type: "success",
      message: "Survival mode activated. Your budget is protected."
    });
    load();
  }

  if (!state && !isPending) {
    return null;
  }

  return (
    <>
      {state ? <SOSModeActive state={state} onDeactivate={deactivateSOSMode} /> : null}
      {state ? <SOSMode state={state} onActivated={refreshAfterActivation} /> : null}
    </>
  );
}
