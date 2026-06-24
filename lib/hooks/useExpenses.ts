"use client";

import { useRouter } from "next/navigation";
import { useExpenseStore, type AddExpensePayload, type Expense } from "@/store/expenseStore";

type ExpenseFilters = {
  startDate?: string;
  endDate?: string;
  category?: string;
};

export function useExpenses() {
  const router = useRouter();
  const store = useExpenseStore();

  async function addExpense(data: AddExpensePayload) {
    const tempId = `temp-${Date.now()}`;
    const optimisticExpense: Expense = {
      id: tempId,
      amount: data.amount,
      category: data.category,
      note: data.note || null,
      date: data.date,
      created_at: new Date().toISOString(),
      optimistic: true
    };

    store.addExpense(optimisticExpense);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "খরচ যোগ করা যায়নি।");
      }

      store.replaceExpense(tempId, result.expense);
      store.showToast({ message: "খরচ সফলভাবে যোগ হয়েছে", type: "success" });
      router.refresh();

      return result;
    } catch (error) {
      store.deleteExpense(tempId);
      store.showToast({
        message: error instanceof Error ? error.message : "খরচ যোগ করা যায়নি।",
        type: "error"
      });
      throw error;
    }
  }

  async function getExpenses(filters: ExpenseFilters = {}) {
    const params = new URLSearchParams();

    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.category) params.set("category", filters.category);

    const response = await fetch(`/api/expenses?${params.toString()}`, {
      cache: "no-store"
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "খরচের তালিকা লোড করা যায়নি।");
    }

    store.setExpenses(result.expenses || []);
    store.setFilters(filters);

    return result.expenses as Expense[];
  }

  async function deleteExpense(id: string) {
    const previous = store.expenses;
    store.deleteExpense(id);

    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "খরচ মুছে ফেলা যায়নি।");
      }

      store.showToast({ message: "খরচ মুছে ফেলা হয়েছে", type: "success" });
      router.refresh();
    } catch (error) {
      store.setExpenses(previous);
      store.showToast({
        message: error instanceof Error ? error.message : "খরচ মুছে ফেলা যায়নি।",
        type: "error"
      });
      throw error;
    }
  }

  return {
    ...store,
    addExpense,
    getExpenses,
    deleteExpense
  };
}
