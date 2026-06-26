"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FixedExpense = {
  id: string;
  title: string;
  amount: number;
  due_day: number | null;
};

type BudgetStepProps = {
  value: {
    savingsGoal: number | null;
    emergencyReserve: number | null;
    fixedExpenses: FixedExpense[];
    firstDayOfMonth: number;
  };
  safeDailyBudget: number;
  onChange: (value: Partial<BudgetStepProps["value"]>) => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function BudgetStep({ value, safeDailyBudget, onChange, onNext, onPrevious }: BudgetStepProps) {
  function parseNumberInput(input: string) {
    if (!input.trim()) {
      return null;
    }

    const amount = Number(input);
    return Number.isFinite(amount) ? amount : null;
  }

  function addFixedExpense() {
    onChange({
      fixedExpenses: [
        ...value.fixedExpenses,
        { id: `fixed-${Date.now()}`, title: "", amount: 0, due_day: null }
      ]
    });
  }

  function updateItem(id: string, patch: Partial<FixedExpense>) {
    onChange({
      fixedExpenses: value.fixedExpenses.map((item) => (item.id === id ? { ...item, ...patch } : item))
    });
  }

  function removeItem(id: string) {
    onChange({
      fixedExpenses: value.fixedExpenses.filter((item) => item.id !== id)
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Budget preferences</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Savings target আর fixed monthly expenses জানলে safe daily spending limit বোঝা সহজ হয়।
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="savings-goal">How much do you want to save monthly?</Label>
          <Input
            id="savings-goal"
            type="number"
            value={value.savingsGoal ?? ""}
            onChange={(event) => onChange({ savingsGoal: parseNumberInput(event.target.value) })}
            placeholder="Enter 0 if you want to decide later"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergency-reserve">Emergency reserve</Label>
          <Input
            id="emergency-reserve"
            type="number"
            value={value.emergencyReserve ?? ""}
            onChange={(event) => onChange({ emergencyReserve: parseNumberInput(event.target.value) })}
            placeholder="Enter 0 if you do not want a reserve yet"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="first-day-cycle">First day of month for budget cycle</Label>
          <select
            id="first-day-cycle"
            value={value.firstDayOfMonth}
            onChange={(event) => onChange({ firstDayOfMonth: Number(event.target.value) })}
            className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background"
          >
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
              <option key={day} value={day}>
                Day {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/70 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-50">Any fixed monthly expenses?</p>
            <p className="text-sm text-muted-foreground">Semester fees installment, subscriptions, rent, internet.</p>
          </div>
          <Button type="button" variant="outline" className="rounded-full" onClick={addFixedExpense}>
            <Plus className="mr-2 h-4 w-4" />
            Add item
          </Button>
        </div>

        <div className="space-y-3">
          {value.fixedExpenses.map((item) => (
            <div key={item.id} className="grid gap-3 md:grid-cols-[1.3fr_0.8fr_0.7fr_auto]">
              <Input
                value={item.title}
                onChange={(event) => updateItem(item.id, { title: event.target.value })}
                placeholder="Expense title"
              />
              <Input
                type="number"
                value={item.amount}
                onChange={(event) => updateItem(item.id, { amount: Number(event.target.value) })}
                placeholder="Amount"
              />
              <Input
                type="number"
                min="1"
                max="31"
                value={item.due_day || ""}
                onChange={(event) =>
                  updateItem(item.id, {
                    due_day: event.target.value ? Number(event.target.value) : null
                  })
                }
                placeholder="Due day"
              />
              <Button type="button" variant="outline" className="rounded-full" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-emerald-200 bg-emerald-50/90 px-5 py-5 text-emerald-950 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-700">Auto-calculation</p>
        <p className="mt-3 text-xl font-semibold">Based on your inputs, you can safely spend ৳{safeDailyBudget.toFixed(0)} per day</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" className="rounded-full" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" className="rounded-full" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
