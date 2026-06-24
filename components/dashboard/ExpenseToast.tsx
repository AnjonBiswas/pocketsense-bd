"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useExpenseStore } from "@/store/expenseStore";

export function ExpenseToast() {
  const toast = useExpenseStore((state) => state.toast);
  const clearToast = useExpenseStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      clearToast();
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [toast, clearToast]);

  if (!toast) {
    return null;
  }

  const isSuccess = toast.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertTriangle;

  return (
    <div className="fixed right-4 top-4 z-[60] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-white/60 bg-white/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <div className={isSuccess ? "text-emerald-600" : "text-rose-600"}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{isSuccess ? "Success" : "Error"}</p>
          <p className="text-sm text-muted-foreground">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}
