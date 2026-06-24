"use client";

import { useState } from "react";
import { Plus, WalletCards, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const presets = [
  { amount: 50, label: "চা" },
  { amount: 100, label: "স্ন্যাকস" },
  { amount: 200, label: "খাবার" }
];

export function QuickExpenseButtons() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  function openPreset(amount: number) {
    setSelectedAmount(amount);
    setCustomAmount("");
    setIsOpen(true);
  }

  function openCustom() {
    setSelectedAmount(null);
    setCustomAmount("");
    setIsOpen(true);
  }

  return (
    <>
      <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">দ্রুত খরচ যোগ করো</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {presets.map((item) => (
            <Button
              key={item.label}
              type="button"
              variant="outline"
              className="h-auto justify-start rounded-2xl px-4 py-4 text-left"
              onClick={() => openPreset(item.amount)}
            >
              <div>
                <p className="font-semibold">৳{item.amount} {item.label}</p>
                <p className="text-xs text-muted-foreground">এক ক্লিকে লিখে রাখো</p>
              </div>
            </Button>
          ))}
          <Button
            type="button"
            className="h-auto rounded-2xl px-4 py-4"
            onClick={openCustom}
          >
            <Plus className="mr-2 h-4 w-4" />
            Custom amount
          </Button>
        </CardContent>
      </Card>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Expense modal</p>
                <h3 className="mt-1 text-xl font-semibold">খরচ যোগ করার জন্য প্রস্তুত</h3>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-sm text-muted-foreground">Selected amount</p>
                <p className="mt-2 text-3xl font-bold">
                  ৳{selectedAmount ?? (customAmount || "0")}
                </p>
              </div>

              {!selectedAmount ? (
                <div className="space-y-2">
                  <label htmlFor="custom-amount" className="text-sm font-medium">
                    কাস্টম পরিমাণ
                  </label>
                  <input
                    id="custom-amount"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, ""))}
                    placeholder="যেমন 150"
                    className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              ) : null}

              <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <WalletCards className="h-4 w-4" />
                  Modal is open successfully
                </div>
                <p className="mt-2">
                  The actual expense form submission can plug into your expenses table next.
                </p>
              </div>

              <Button type="button" className="w-full" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
