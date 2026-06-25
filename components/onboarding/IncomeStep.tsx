"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type IncomeStepProps = {
  value: {
    allowance: number;
    hasTuition: boolean;
    tuitionAmount: number;
    hasFreelance: boolean;
    freelanceAmount: number;
    giftFrequency: "rarely" | "sometimes" | "often";
  };
  onChange: (value: Partial<IncomeStepProps["value"]>) => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function IncomeStep({ value, onChange, onNext, onPrevious }: IncomeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Income setup</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          আপনার regular income sources দিলেই PocketSense accurate monthly plan করতে পারবে।
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="allowance">What&apos;s your monthly allowance?</Label>
          <Input
            id="allowance"
            type="number"
            value={value.allowance}
            onChange={(event) => onChange({ allowance: Number(event.target.value) })}
          />
        </div>

        <div className="space-y-3 rounded-[28px] border border-slate-200 bg-slate-50/70 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-slate-900 dark:text-slate-50">Do you have tuition income?</p>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${value.hasTuition ? "bg-primary text-primary-foreground" : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-100"}`}
              onClick={() => onChange({ hasTuition: !value.hasTuition })}
            >
              {value.hasTuition ? "Yes" : "No"}
            </button>
          </div>
          {value.hasTuition ? (
            <Input
              type="number"
              value={value.tuitionAmount}
              onChange={(event) => onChange({ tuitionAmount: Number(event.target.value) })}
              placeholder="Estimated monthly tuition income"
            />
          ) : null}
        </div>

        <div className="space-y-3 rounded-[28px] border border-slate-200 bg-slate-50/70 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-slate-900 dark:text-slate-50">Do you freelance?</p>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${value.hasFreelance ? "bg-primary text-primary-foreground" : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-100"}`}
              onClick={() => onChange({ hasFreelance: !value.hasFreelance })}
            >
              {value.hasFreelance ? "Yes" : "No"}
            </button>
          </div>
          {value.hasFreelance ? (
            <Input
              type="number"
              value={value.freelanceAmount}
              onChange={(event) => onChange({ freelanceAmount: Number(event.target.value) })}
              placeholder="Estimated freelance income"
            />
          ) : null}
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label>Eid/Birthday money frequency</Label>
          <input
            type="range"
            min="0"
            max="2"
            step="1"
            value={value.giftFrequency === "rarely" ? 0 : value.giftFrequency === "sometimes" ? 1 : 2}
            onChange={(event) =>
              onChange({
                giftFrequency: event.target.value === "0" ? "rarely" : event.target.value === "1" ? "sometimes" : "often"
              })
            }
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Rarely</span>
            <span>Sometimes</span>
            <span>Often</span>
          </div>
        </div>
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
