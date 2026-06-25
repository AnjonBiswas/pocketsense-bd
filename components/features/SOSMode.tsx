"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Flame, ShieldCheck } from "lucide-react";
import { SURVIVAL_TIPS } from "@/data/survivalTips";
import { BudgetLock } from "@/components/features/BudgetLock";
import { SOSAutoMessage } from "@/components/features/SOSAutoMessage";
import { Button } from "@/components/ui/button";

type SOSModeProps = {
  state: {
    shouldActivate: boolean;
    severity: "warning" | "critical";
    remainingBudget: number;
    daysRemaining: number;
  };
  onActivated: () => Promise<void> | void;
};

export function SOSMode({ state, onActivated }: SOSModeProps) {
  const [selectedTips, setSelectedTips] = useState<string[]>(["cook_home", "walk"]);
  const [friendName, setFriendName] = useState("");
  const [lockedAmount, setLockedAmount] = useState(0);
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const totalSavings = useMemo(
    () =>
      SURVIVAL_TIPS.filter((tip) => selectedTips.includes(tip.id)).reduce((sum, tip) => sum + tip.savings, 0),
    [selectedTips]
  );

  if (!state.shouldActivate || acknowledged) {
    return null;
  }

  async function activate() {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "activate",
          tipsActivated: selectedTips,
          pin: pin.length === 4 ? pin : undefined,
          lockedAmount
        })
      });

      if (!response.ok) {
        throw new Error("Failed to activate survival mode.");
      }

      await onActivated();
      setAcknowledged(true);
    } catch {
      // Keep the screen open; banner/toast feedback is handled by the parent shell.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/75 backdrop-blur-md">
      <div className="min-h-screen px-4 py-6 md:px-6">
        <div className="mx-auto max-w-5xl rounded-[36px] border border-red-200/40 bg-[linear-gradient(135deg,#fff7ed_0%,#fff1f2_48%,#ffedd5_100%)] p-6 shadow-2xl md:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  {state.severity === "critical" ? "Critical cash alert" : "Emergency budget alert"}
                </div>
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                    ⚠️ Emergency! Only ৳{state.remainingBudget} left for {state.daysRemaining} days
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 md:text-base">
                    Your current pace is below the safe ৳100/day survival line. Turn on Survival Mode now to
                    protect your month-end cash and avoid last-minute borrowing.
                  </p>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Pick your survival tips</h3>
                    <p className="text-sm text-muted-foreground">
                      Activated tips can save about ৳{totalSavings} per day.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
                    <Flame className="mr-2 inline h-4 w-4" />
                    Save ৳{totalSavings}/day
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {SURVIVAL_TIPS.map((tip) => {
                    const active = selectedTips.includes(tip.id);

                    return (
                      <button
                        key={tip.id}
                        type="button"
                        className={`rounded-[26px] border px-4 py-4 text-left transition ${
                          active
                            ? "border-red-200 bg-red-50 shadow-sm"
                            : "border-white/80 bg-white/70 hover:border-orange-200 hover:bg-orange-50/70"
                        }`}
                        onClick={() =>
                          setSelectedTips((current) =>
                            current.includes(tip.id)
                              ? current.filter((value) => value !== tip.id)
                              : [...current, tip.id]
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{tip.title.bn}</p>
                            <p className="mt-1 text-sm text-slate-600">{tip.description.bn}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-700">
                            ৳{tip.savings}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <BudgetLock
                mode="setup"
                lockedAmount={lockedAmount}
                pin={pin}
                onLockedAmountChange={setLockedAmount}
                onPinChange={setPin}
              />
            </div>

            <div className="space-y-5">
              <div className="rounded-[30px] border border-white/80 bg-white/85 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Survival checklist</p>
                    <p className="text-sm text-muted-foreground">
                      Lock a small reserve, cut cafe spending, and message friends before plans get expensive.
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li>Spend only on essentials: food, transport, mobile, health.</li>
                  <li>Avoid cafe and entertainment unless you unlock with your PIN.</li>
                  <li>Review this plan daily until your budget recovers.</li>
                </ul>
              </div>

              <SOSAutoMessage
                friendName={friendName}
                onFriendNameChange={setFriendName}
                remainingBudget={state.remainingBudget}
                daysRemaining={state.daysRemaining}
              />

              <div className="rounded-[30px] border border-red-200 bg-red-50/70 p-5">
                <p className="text-sm font-medium text-red-800">
                  This alert is intentionally hard to ignore because your current survival budget is under ৳100 per day.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  className="h-12 rounded-full bg-red-600 text-base hover:bg-red-700"
                  disabled={isSubmitting}
                  onClick={activate}
                >
                  {isSubmitting ? "Activating..." : "Activate Survival Mode"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-orange-300 bg-white/80 text-slate-700"
                  onClick={() => setAcknowledged(true)}
                >
                  I understand, remind me later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
