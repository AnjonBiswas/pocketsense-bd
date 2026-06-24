"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { CATEGORIES, getCategoryMeta } from "@/lib/utils/categories";
import type { Expense } from "@/store/expenseStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditExpenseModalProps = {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (expense: Expense) => void;
};

export function EditExpenseModal({ expense, open, onOpenChange, onUpdated }: EditExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!expense) return;

    setAmount(String(expense.amount));
    setCategory(expense.category);
    setNote(expense.note || "");
    setDate(expense.date);
    setError("");
  }, [expense]);

  const submit = () => {
    if (!expense) return;

    setError("");
    startTransition(async () => {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Number(amount),
          category,
          note,
          date
        })
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error || "খরচ আপডেট করা যায়নি।");
        return;
      }

      onUpdated(payload.expense);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>খরচ এডিট করুন</DialogTitle>
          <DialogDescription>পরিমাণ, category, note বা date বদলাতে পারেন।</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="edit-expense-amount">Amount (BDT)</Label>
            <Input
              id="edit-expense-amount"
              type="number"
              min="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(CATEGORIES).map(([key, value]) => {
                const isActive = category === key;

                return (
                  <button
                    key={key}
                    type="button"
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-white/60 bg-secondary/40 hover:bg-secondary/70"
                    }`}
                    onClick={() => setCategory(key)}
                  >
                    <div className="text-xl">{value.icon}</div>
                    <p className="mt-2 text-sm font-semibold">{value.bn}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-expense-note">Note</Label>
            <Input
              id="edit-expense-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={`${getCategoryMeta(category).bn} সম্পর্কে কিছু লিখতে চাইলে লিখুন`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-expense-date">Date</Label>
            <Input id="edit-expense-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={isPending} onClick={submit}>
              {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update expense
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

