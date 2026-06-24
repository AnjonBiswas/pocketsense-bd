"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INCOME_SOURCES, type IncomeSource, getIncomeSourceMeta } from "@/lib/utils/income";

export type AddIncomeModalPrefill = {
  amount?: number;
  source?: IncomeSource;
  note?: string;
  isRecurring?: boolean;
  date?: string;
};

type AddIncomeModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  prefill?: AddIncomeModalPrefill;
  triggerLabel?: string;
  onSuccess?: () => Promise<void> | void;
};

const initialForm = {
  amount: "",
  source: "allowance" as IncomeSource,
  date: new Date().toISOString().slice(0, 10),
  note: "",
  isRecurring: false
};

export function AddIncomeModal({
  open,
  onOpenChange,
  prefill,
  triggerLabel = "আয় যোগ করুন",
  onSuccess
}: AddIncomeModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isControlled = typeof open === "boolean";
  const actualOpen = isControlled ? open : internalOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (!actualOpen) return;

    setForm({
      amount: prefill?.amount ? String(prefill.amount) : initialForm.amount,
      source: prefill?.source || initialForm.source,
      date: prefill?.date || initialForm.date,
      note: prefill?.note || initialForm.note,
      isRecurring: prefill?.isRecurring || initialForm.isRecurring
    });
    setError("");
  }, [actualOpen, prefill]);

  const submit = () => {
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/income", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Number(form.amount),
          source: form.source,
          date: form.date,
          note: form.note || null,
          is_recurring: form.isRecurring
        })
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error || "আয় যোগ করা যায়নি।");
        return;
      }

      setOpen(false);
      await onSuccess?.();
      setForm(initialForm);
    });
  };

  return (
    <Dialog open={actualOpen} onOpenChange={setOpen}>
      {!isControlled ? (
        <DialogTrigger asChild>
          <Button className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="border-white/70 bg-white/95 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">নতুন আয় যোগ করুন</DialogTitle>
          <DialogDescription>
            ভাতা, টিউশন, ফ্রিল্যান্স বা অন্য যেকোনো আয়ের উৎস এখানে লিখে রাখুন।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="income-amount">Amount (BDT)</Label>
            <Input
              id="income-amount"
              type="number"
              min="0"
              placeholder="2500"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            />
          </div>

          <div className="space-y-3">
            <Label>Source</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.values(INCOME_SOURCES).map((source) => {
                const isSelected = form.source === source.value;

                return (
                  <button
                    key={source.value}
                    type="button"
                    className={`rounded-3xl border px-4 py-4 text-left transition ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-50 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/60"
                    }`}
                    onClick={() => setForm((current) => ({ ...current, source: source.value }))}
                  >
                    <div className="text-2xl">{source.icon}</div>
                    <p className="mt-2 font-semibold">{source.bn}</p>
                    <CardDescription>{source.en}</CardDescription>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income-date">Date</Label>
              <Input
                id="income-date"
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isRecurring: event.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <p className="font-medium">Recurring income</p>
                <p className="text-sm text-muted-foreground">প্রতি মাসে বা নিয়মিত আসে</p>
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-note">
              Note
              {form.source === "tuition" ? " / Student Name" : ""}
            </Label>
            <Input
              id="income-note"
              placeholder={
                form.source === "tuition"
                  ? "Student: Arafat"
                  : `e.g. ${getIncomeSourceMeta(form.source).en} details`
              }
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            />
          </div>

          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={submit}
              disabled={isPending}
              className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              আয় সেভ করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

