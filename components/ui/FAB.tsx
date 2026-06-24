"use client";

import { Plus } from "lucide-react";
import { useExpenseStore } from "@/store/expenseStore";
import { Button } from "@/components/ui/button";

export function FAB() {
  const openAddExpenseModal = useExpenseStore((state) => state.openAddExpenseModal);

  return (
    <Button
      type="button"
      onClick={() => openAddExpenseModal()}
      className="fixed bottom-8 right-8 z-40 hidden h-14 w-14 rounded-full shadow-2xl shadow-primary/30 transition-transform hover:scale-105 xl:inline-flex animate-[bounce_2.5s_infinite]"
      aria-label="Add expense"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
