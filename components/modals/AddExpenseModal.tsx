"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { CATEGORIES, getCategoryMeta } from "@/lib/utils/categories";
import { useExpenses } from "@/lib/hooks/useExpenses";
import { useExpenseStore } from "@/store/expenseStore";
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

export function AddExpenseModal() {
  const { addExpense } = useExpenses();
  const isOpen = useExpenseStore((state) => state.isAddExpenseOpen);
  const draftExpense = useExpenseStore((state) => state.draftExpense);
  const closeModal = useExpenseStore((state) => state.closeAddExpenseModal);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAmount(draftExpense.amount ? String(draftExpense.amount) : "");
    setCategory(draftExpense.category || "food");
    setNote(draftExpense.note || "");
    setDate(draftExpense.date || new Date().toISOString().slice(0, 10));
    setError("");
  }, [draftExpense, isOpen]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("সঠিক টাকার পরিমাণ লিখুন।");
      return;
    }

    setIsSubmitting(true);

    try {
      await addExpense({
        amount: numericAmount,
        category,
        note,
        date
      });
      closeModal();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "খরচ যোগ করা যায়নি।");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? closeModal() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>নতুন খরচ যোগ করো</DialogTitle>
          <DialogDescription>Amount, category, note, and date দিয়ে দ্রুত expense save করো.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="expense-amount">Amount (BDT)</Label>
            <Input
              id="expense-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="যেমন 150"
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
            <Label htmlFor="expense-note">Note</Label>
            <Input
              id="expense-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={`${getCategoryMeta(category).bn} সম্পর্কে কিছু লিখতে চাইলে লিখুন`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-date">Date</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Saving..." : "Submit Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
