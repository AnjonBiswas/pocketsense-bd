"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FixedExpense = {
  id: string;
  title: string;
  amount: number;
  due_day: number | null;
};

type BudgetData = {
  budget: {
    monthlyIncome: number;
    savingsGoal: number;
    emergencyReserve: number;
    monthlyLimit: number;
    fixedExpenses: FixedExpense[];
  };
};

export function BudgetSettingsClient() {
  const [data, setData] = useState<BudgetData | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!payload?.error) {
          setData(payload);
        }
      })
      .catch(() => null);
  }, []);

  const totalFixedExpenses = useMemo(
    () => data?.budget.fixedExpenses.reduce((sum, item) => sum + Number(item.amount), 0) || 0,
    [data]
  );

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Loading budget settings...
      </div>
    );
  }

  function updateBudget<K extends keyof BudgetData["budget"]>(key: K, value: BudgetData["budget"][K]) {
    setData((current) => (current ? { ...current, budget: { ...current.budget, [key]: value } } : current));
  }

  function addFixedExpense() {
    if (!data) {
      return;
    }

    updateBudget("fixedExpenses", [
      ...data.budget.fixedExpenses,
      {
        id: `draft-${Date.now()}`,
        title: "",
        amount: 0,
        due_day: null
      }
    ]);
  }

  function updateFixedExpense(id: string, patch: Partial<FixedExpense>) {
    if (!data) {
      return;
    }

    updateBudget(
      "fixedExpenses",
      data.budget.fixedExpenses.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function deleteFixedExpense(id: string) {
    if (!data) {
      return;
    }

    updateBudget(
      "fixedExpenses",
      data.budget.fixedExpenses.filter((item) => item.id !== id)
    );
  }

  function saveBudget() {
    if (!data) {
      return;
    }

    const currentBudget = data.budget;

    startTransition(async () => {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          section: "budget",
          ...currentBudget
        })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.settings) {
        setMessage(payload?.error || "Could not save budget settings.");
        return;
      }

      setData(payload.settings);
      setMessage("Budget settings saved and recalculated.");
    });
  }

  return (
    <div className="space-y-5">
      <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
        <CardHeader>
          <CardTitle>Budget Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthly-income">Monthly income</Label>
              <Input
                id="monthly-income"
                type="number"
                value={data.budget.monthlyIncome}
                onChange={(event) => updateBudget("monthlyIncome", Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-limit">Monthly spending limit</Label>
              <Input
                id="monthly-limit"
                type="number"
                value={data.budget.monthlyLimit}
                onChange={(event) => updateBudget("monthlyLimit", Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="savings-goal">Savings goal</Label>
              <Input
                id="savings-goal"
                type="number"
                value={data.budget.savingsGoal}
                onChange={(event) => updateBudget("savingsGoal", Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency-reserve">Emergency reserve</Label>
              <Input
                id="emergency-reserve"
                type="number"
                value={data.budget.emergencyReserve}
                onChange={(event) => updateBudget("emergencyReserve", Number(event.target.value))}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-900">
            Fixed monthly expenses total: ৳{totalFixedExpenses.toFixed(0)}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-50">Fixed monthly expenses</p>
                <p className="text-sm text-muted-foreground">Rent, semester fee, subscriptions, and other recurring items.</p>
              </div>
              <Button type="button" variant="outline" className="rounded-full" onClick={addFixedExpense}>
                <Plus className="mr-2 h-4 w-4" />
                Add item
              </Button>
            </div>

            <div className="space-y-3">
              {data.budget.fixedExpenses.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-[26px] border border-slate-200 bg-slate-50/70 px-4 py-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto] dark:border-slate-700 dark:bg-slate-900/60">
                  <Input
                    value={item.title}
                    onChange={(event) => updateFixedExpense(item.id, { title: event.target.value })}
                    placeholder="Expense title"
                  />
                  <Input
                    type="number"
                    value={item.amount}
                    onChange={(event) => updateFixedExpense(item.id, { amount: Number(event.target.value) })}
                    placeholder="Amount"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={item.due_day || ""}
                    onChange={(event) =>
                      updateFixedExpense(item.id, {
                        due_day: event.target.value ? Number(event.target.value) : null
                      })
                    }
                    placeholder="Due day"
                  />
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => deleteFixedExpense(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" className="rounded-full" disabled={isPending} onClick={saveBudget}>
              {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Recalculate budget
            </Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
