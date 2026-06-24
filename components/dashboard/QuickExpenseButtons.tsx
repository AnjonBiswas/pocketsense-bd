"use client";

import { Plus } from "lucide-react";
import { useExpenseStore } from "@/store/expenseStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const presets = [
  { amount: 50, label: "চা" },
  { amount: 100, label: "স্ন্যাকস" },
  { amount: 200, label: "খাবার" }
];

export function QuickExpenseButtons() {
  const openAddExpenseModal = useExpenseStore((state) => state.openAddExpenseModal);

  return (
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
            onClick={() => openAddExpenseModal({ amount: item.amount })}
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
          onClick={() => openAddExpenseModal()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Custom amount
        </Button>
      </CardContent>
    </Card>
  );
}
