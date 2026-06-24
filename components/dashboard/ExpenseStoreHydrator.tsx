"use client";

import { useEffect } from "react";
import { useExpenseStore, type Expense } from "@/store/expenseStore";

export function ExpenseStoreHydrator({ initialExpenses }: { initialExpenses: Expense[] }) {
  const setExpenses = useExpenseStore((state) => state.setExpenses);

  useEffect(() => {
    setExpenses(initialExpenses);
  }, [initialExpenses, setExpenses]);

  return null;
}
