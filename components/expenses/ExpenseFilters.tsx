"use client";

import type React from "react";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CATEGORIES } from "@/lib/utils/categories";
import type { ExpenseFilterState, FilterPreset } from "@/lib/hooks/useExpenseFilters";
import { getPresetRange } from "@/lib/utils/expenses";

type ExpenseFiltersProps = {
  draft: ExpenseFilterState;
  setDraft: React.Dispatch<React.SetStateAction<ExpenseFilterState>>;
  setPreset: (preset: FilterPreset) => void;
  onApply: () => void;
  onReset: () => void;
};

const presets: Array<{ key: FilterPreset; label: string }> = [
  { key: "thisWeek", label: "This week" },
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "custom", label: "Custom" }
];

export function ExpenseFilters({ draft, setDraft, setPreset, onApply, onReset }: ExpenseFiltersProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="rounded-full">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,420px)] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Filter expenses</p>
            <p className="text-sm text-muted-foreground">Date, category, amount, আর note দিয়ে refine করুন।</p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="space-y-3">
          <Label>Date range</Label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className={`rounded-2xl border px-3 py-2 text-sm transition ${
                  draft.preset === preset.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
                onClick={() => {
                  setPreset(preset.key);
                  if (preset.key !== "custom") {
                    const range = getPresetRange(preset.key);
                    setDraft((current) => ({ ...current, preset: preset.key, ...range }));
                  }
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="date"
              value={draft.startDate}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  preset: "custom",
                  startDate: event.target.value
                }))
              }
            />
            <Input
              type="date"
              value={draft.endDate}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  preset: "custom",
                  endDate: event.target.value
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CATEGORIES).map(([key, value]) => {
              const active = draft.categories.includes(key);

              return (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      setDraft((current) => ({
                        ...current,
                        categories: active
                          ? current.categories.filter((item) => item !== key)
                          : [...current.categories, key]
                      }))
                    }
                    className="sr-only"
                  />
                  <span className="text-lg">{value.icon}</span>
                  <span className="text-sm font-medium">{value.bn}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Amount range</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="number"
              min="0"
              placeholder="Min"
              value={draft.minAmount}
              onChange={(event) => setDraft((current) => ({ ...current, minAmount: event.target.value }))}
            />
            <Input
              type="number"
              min="0"
              placeholder="Max"
              value={draft.maxAmount}
              onChange={(event) => setDraft((current) => ({ ...current, maxAmount: event.target.value }))}
            />
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="50"
            value={draft.maxAmount || "5000"}
            onChange={(event) => setDraft((current) => ({ ...current, maxAmount: event.target.value }))}
            className="w-full accent-[hsl(var(--primary))]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense-search">Search note</Label>
          <Input
            id="expense-search"
            placeholder="e.g. tea, bus fare"
            value={draft.search}
            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="rounded-full" onClick={onReset}>
            Reset
          </Button>
          <Button type="button" className="rounded-full" onClick={onApply}>
            Apply filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
