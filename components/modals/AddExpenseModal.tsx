"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Sparkles, Wand2 } from "lucide-react";
import { BudgetLock } from "@/components/features/BudgetLock";
import { ExpenseTemplates } from "@/components/features/ExpenseTemplates";
import { ThemeIllustration } from "@/components/features/ThemeIllustration";
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
import { useExpenses } from "@/lib/hooks/useExpenses";
import { suggestCategoryFromNote } from "@/lib/ml/categorizer";
import { CATEGORIES, getCategoryMeta } from "@/lib/utils/categories";
import type { ExpenseTemplate } from "@/lib/utils/expenseTemplates";
import { useExpenseStore } from "@/store/expenseStore";

const ReceiptScanner = dynamic(
  () => import("@/components/features/ReceiptScanner").then((module) => module.ReceiptScanner),
  {
    ssr: false,
    loading: () => <div className="rounded-[28px] border border-violet-200/80 bg-violet-50/60 p-5 text-sm text-violet-900">Loading receipt tools...</div>
  }
);

const TreatCalculator = dynamic(
  () => import("@/components/features/TreatCalculator").then((module) => module.TreatCalculator),
  {
    ssr: false,
    loading: () => <div className="rounded-[28px] border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-950">Preparing treat calculator...</div>
  }
);

type BudgetSnapshot = {
  dailyBudget: number;
  remainingBudget: number;
  daysRemaining: number;
};

type SOSSnapshot = {
  isActive: boolean;
  shouldActivate: boolean;
  severity: "warning" | "critical";
  remainingBudget: number;
  daysRemaining: number;
  lockedAmount: number;
  hasLockedFunds: boolean;
  hasPin: boolean;
  luxuryWarning: string | null;
};

const TREAT_CATEGORIES = new Set(["food", "cafe", "entertainment"]);
const LUXURY_CATEGORIES = new Set(["cafe", "entertainment"]);

export function AddExpenseModal() {
  const { addExpense } = useExpenses();
  const isOpen = useExpenseStore((state) => state.isAddExpenseOpen);
  const draftExpense = useExpenseStore((state) => state.draftExpense);
  const closeModal = useExpenseStore((state) => state.closeAddExpenseModal);
  const showToast = useExpenseStore((state) => state.showToast);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTreatView, setIsLoadingTreatView] = useState(false);
  const [error, setError] = useState("");
  const [showTreatCalculator, setShowTreatCalculator] = useState(false);
  const [budgetSnapshot, setBudgetSnapshot] = useState<BudgetSnapshot | null>(null);
  const [sosSnapshot, setSosSnapshot] = useState<SOSSnapshot | null>(null);
  const [overrideEmergency, setOverrideEmergency] = useState(false);
  const [unlockPin, setUnlockPin] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isEmergencyUnlocked, setIsEmergencyUnlocked] = useState(false);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [categorySuggestion, setCategorySuggestion] = useState<{
    category: string | null;
    confidence: number;
  } | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const numericAmount = useMemo(() => Number(amount), [amount]);
  const isTreatCategory = TREAT_CATEGORIES.has(category);
  const isLuxuryCategory = LUXURY_CATEGORIES.has(category);
  const isLuxurySpendBlocked = Boolean(sosSnapshot?.isActive && isLuxuryCategory);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAmount(draftExpense.amount ? String(draftExpense.amount) : "");
    setCategory(draftExpense.category || "food");
    setNote(draftExpense.note || "");
    setDate(draftExpense.date || new Date().toISOString().slice(0, 10));
    setError("");
    setShowTreatCalculator(false);
    setBudgetSnapshot(null);
    setSosSnapshot(null);
    setOverrideEmergency(false);
    setUnlockPin("");
    setUnlockError("");
    setIsEmergencyUnlocked(false);
    setCategoryTouched(Boolean(draftExpense.category));
    setCategorySuggestion(null);
    setReceiptUrl(null);
  }, [draftExpense, isOpen]);

  useEffect(() => {
    const suggestion = suggestCategoryFromNote(note);
    setCategorySuggestion({
      category: suggestion.category,
      confidence: suggestion.confidence
    });

    if (!categoryTouched && suggestion.category && suggestion.confidence >= 0.34) {
      setCategory(suggestion.category);
    }
  }, [categoryTouched, note]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    fetch("/api/sos", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.error) {
          return;
        }

        setSosSnapshot(payload);
      })
      .catch(() => null);
  }, [isOpen]);

  async function unlockEmergencyFunds() {
    setUnlockError("");
    setIsUnlocking(true);

    try {
      const response = await fetch("/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "unlock",
          pin: unlockPin
        })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.unlocked) {
        setUnlockError(payload?.error || "Incorrect PIN.");
        return;
      }

      setIsEmergencyUnlocked(true);
      setUnlockError("");
      showToast({
        type: "success",
        message: "Emergency funds unlocked for this expense."
      });
    } finally {
      setIsUnlocking(false);
    }
  }

  async function submitExpense() {
    const safeAmount = Number(amount);

    if (!safeAmount || safeAmount <= 0) {
      setError("সঠিক টাকার পরিমাণ লিখুন।");
      return;
    }

    if (isLuxurySpendBlocked && sosSnapshot?.hasPin && !isEmergencyUnlocked) {
      setError("SOS mode চালু আছে। এই category-তে খরচ করতে PIN unlock লাগবে।");
      return;
    }

    if (isLuxurySpendBlocked && !sosSnapshot?.hasPin && !overrideEmergency) {
      setError("SOS mode warning দেখে override confirm করুন।");
      return;
    }

    setIsSubmitting(true);

    try {
      await addExpense({
        amount: safeAmount,
        category,
        note: [note.trim(), receiptUrl ? "Receipt scanned" : ""].filter(Boolean).join(" • "),
        date,
        overrideEmergency,
        unlockPin: isEmergencyUnlocked ? unlockPin : undefined
      });
      closeModal();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "খরচ যোগ করা যায়নি।");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!numericAmount || numericAmount <= 0) {
      setError("সঠিক টাকার পরিমাণ লিখুন।");
      return;
    }

    await submitExpense();
  }

  async function openTreatCalculator() {
    setError("");

    if (!numericAmount || numericAmount <= 0) {
      setError("Treat calculator দেখার আগে amount লিখুন।");
      return;
    }

    setIsLoadingTreatView(true);

    try {
      const response = await fetch("/api/dashboard/stats", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        throw new Error("Treat impact load করা যায়নি।");
      }

      setBudgetSnapshot({
        dailyBudget: Number(payload.dailyBudget || 0),
        remainingBudget: Number(payload.remainingBudget || 0),
        daysRemaining: Number(payload.daysRemaining || 1)
      });
      setShowTreatCalculator(true);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Treat impact load করা যায়নি।");
    } finally {
      setIsLoadingTreatView(false);
    }
  }

  function applyTemplate(template: ExpenseTemplate) {
    setAmount(String(template.amount));
    setCategory(template.category);
    setNote(template.note);
    setCategoryTouched(true);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:!w-[min(92vw,66rem)] sm:!max-w-[66rem] sm:p-0">
        <DialogHeader className="border-b border-slate-200/70 px-5 pb-4 pt-6 sm:px-7 sm:pb-5">
          <DialogTitle>নতুন খরচ যোগ করো</DialogTitle>
          <DialogDescription>Amount, category, note, and date দিয়ে দ্রুত expense save করো.</DialogDescription>
        </DialogHeader>

        <form className="space-y-6 px-5 pb-5 pt-5 sm:px-7 sm:pb-7" onSubmit={handleSubmit}>
          <div className="rounded-[30px] border border-slate-200/80 bg-slate-50/70 p-4 shadow-sm sm:p-5">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] xl:items-start">
              <div className="min-w-0 space-y-3">
                <ReceiptScanner
                  onExtract={({ amount: scannedAmount, date: scannedDate, merchant, note: scannedNote, category: scannedCategory, receiptUrl: scannedReceiptUrl }) => {
                    if (scannedAmount) setAmount(String(scannedAmount));
                    if (scannedDate) setDate(scannedDate);
                    if (merchant || scannedNote) setNote([merchant, scannedNote].filter(Boolean).join(" • "));
                    if (scannedCategory) {
                      setCategory(scannedCategory);
                      setCategoryTouched(true);
                    }
                    if (scannedReceiptUrl) setReceiptUrl(scannedReceiptUrl);
                  }}
                />
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white/85 p-5">
                <ThemeIllustration
                  lightSrc="/illustrations/receipt-light.svg"
                  darkSrc="/illustrations/receipt-dark.svg"
                  alt="Receipt helper"
                  className="mx-auto h-44 w-full max-w-sm object-contain xl:h-48"
                />
                <div className="mt-4 space-y-2">
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">Smart expense entry</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Scan receipts or upload a sheet. We will prefill amount, date, merchant, and suggest the best category.
                  </p>
                </div>
                {receiptUrl ? (
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-medium text-primary"
                  >
                    View uploaded receipt
                  </a>
                ) : null}
              </div>
            </div>
          </div>

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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Object.entries(CATEGORIES).map(([key, value]) => {
                const isActive = category === key;

                return (
                  <button
                    key={key}
                    type="button"
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-secondary/70"
                    }`}
                    onClick={() => {
                      setCategory(key);
                      setCategoryTouched(true);
                    }}
                  >
                    <div className="text-xl">{value.icon}</div>
                    <p className="mt-2 text-sm font-semibold">{value.bn}</p>
                  </button>
                );
              })}
            </div>
            {categorySuggestion?.category && categorySuggestion.category !== category ? (
              <button
                type="button"
                className="inline-flex items-center rounded-full bg-sky-50 px-3 py-2 text-xs font-medium text-sky-900"
                onClick={() => {
                  setCategory(categorySuggestion.category || "other");
                  setCategoryTouched(true);
                }}
              >
                <Wand2 className="mr-2 h-3.5 w-3.5" />
                Suggested: {getCategoryMeta(categorySuggestion.category).en}
              </button>
            ) : null}
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

          <ExpenseTemplates
            current={{
              amount: numericAmount || 0,
              category,
              note
            }}
            onSelect={applyTemplate}
          />

          <div className="space-y-2">
            <Label htmlFor="expense-date">Date</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          {showTreatCalculator && budgetSnapshot ? (
            <TreatCalculator
              amount={numericAmount}
              category={category}
              currentDailyBudget={budgetSnapshot.dailyBudget}
              remainingDays={budgetSnapshot.daysRemaining}
              remainingBudget={budgetSnapshot.remainingBudget}
              onTreatAnyway={submitExpense}
              onSplitBill={() => {
                setShowTreatCalculator(false);
                setNote((current) =>
                  current ? `${current} | Split bill` : `${getCategoryMeta(category).en} | Split bill`
                );
                showToast({
                  type: "success",
                  message: "Split bill noted. We can hook this into Squad Expense Manager next."
                });
              }}
              onCancel={() => setShowTreatCalculator(false)}
            />
          ) : null}

          {isLuxurySpendBlocked && sosSnapshot ? (
            <div className="space-y-3 rounded-[28px] border border-red-200 bg-red-50/80 p-4">
              <div>
                <p className="font-semibold text-red-800">SOS spending warning</p>
                <p className="mt-1 text-sm text-red-700">
                  {sosSnapshot.luxuryWarning ||
                    `Only ৳${sosSnapshot.remainingBudget} left for ${sosSnapshot.daysRemaining} days.`}
                </p>
              </div>

              {sosSnapshot.hasLockedFunds ? (
                <BudgetLock
                  mode="unlock"
                  lockedAmount={sosSnapshot.lockedAmount}
                  hasPin={sosSnapshot.hasPin}
                  pin={unlockPin}
                  isSubmitting={isUnlocking}
                  error={unlockError}
                  onPinChange={setUnlockPin}
                  onUnlock={unlockEmergencyFunds}
                />
              ) : null}

              {!sosSnapshot.hasPin ? (
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    overrideEmergency
                      ? "bg-red-600 text-white"
                      : "border border-red-200 bg-white text-red-700 hover:bg-red-100"
                  }`}
                  onClick={() => setOverrideEmergency((current) => !current)}
                >
                  {overrideEmergency ? "Override confirmed" : "Override warning and continue"}
                </button>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>

            {isTreatCategory ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                disabled={isLoadingTreatView || isSubmitting}
                onClick={openTreatCalculator}
              >
                {isLoadingTreatView ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Calculate Treat
              </Button>
            ) : null}

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
