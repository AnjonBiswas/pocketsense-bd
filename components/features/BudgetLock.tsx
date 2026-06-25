"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BudgetLockProps =
  | {
      mode: "setup";
      lockedAmount: number;
      pin: string;
      onLockedAmountChange: (value: number) => void;
      onPinChange: (value: string) => void;
    }
  | {
      mode: "unlock";
      lockedAmount: number;
      hasPin: boolean;
      pin: string;
      isSubmitting?: boolean;
      error?: string;
      onPinChange: (value: string) => void;
      onUnlock: () => Promise<void> | void;
    };

export function BudgetLock(props: BudgetLockProps) {
  return (
    <div className="rounded-[28px] border border-amber-300/70 bg-white/90 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="font-semibold text-slate-900">Budget Lock</p>
            <p className="text-sm text-muted-foreground">
              {props.mode === "setup"
                ? "Lock part of your emergency money so impulse spending does not touch it."
                : `Locked emergency fund: ৳${props.lockedAmount}`}
            </p>
          </div>

          {props.mode === "setup" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="number"
                min="0"
                value={props.lockedAmount || ""}
                onChange={(event) => props.onLockedAmountChange(Number(event.target.value || 0))}
                placeholder="Lock amount"
              />
              <Input
                inputMode="numeric"
                maxLength={4}
                value={props.pin}
                onChange={(event) => props.onPinChange(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="4-digit PIN"
              />
            </div>
          ) : props.hasPin ? (
            <div className="space-y-3">
              <Input
                inputMode="numeric"
                maxLength={4}
                value={props.pin}
                onChange={(event) => props.onPinChange(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Enter PIN to unlock"
              />
              {props.error ? <p className="text-sm text-destructive">{props.error}</p> : null}
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-amber-300 text-amber-900"
                disabled={props.isSubmitting}
                onClick={props.onUnlock}
              >
                {props.isSubmitting ? "Checking..." : "Unlock emergency funds"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No PIN set. Locked funds can be used without PIN.</p>
          )}
        </div>
      </div>
    </div>
  );
}
