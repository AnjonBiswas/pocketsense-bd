"use client";

import { create } from "zustand";

export type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
  optimistic?: boolean;
};

export type AddExpensePayload = {
  amount: number;
  category: string;
  note?: string;
  date: string;
  overrideEmergency?: boolean;
  unlockPin?: string;
};

type ExpenseFilters = {
  startDate?: string;
  endDate?: string;
  category?: string;
};

type ToastState = {
  message: string;
  type: "success" | "error";
};

type ExpenseStore = {
  expenses: Expense[];
  filters: ExpenseFilters;
  isAddExpenseOpen: boolean;
  draftExpense: Partial<AddExpensePayload>;
  toast: ToastState | null;
  addExpense: (expense: Expense) => void;
  replaceExpense: (tempId: string, expense: Expense) => void;
  setExpenses: (expenses: Expense[]) => void;
  deleteExpense: (id: string) => void;
  setCategoryFilter: (category?: string) => void;
  setFilters: (filters: ExpenseFilters) => void;
  openAddExpenseModal: (draft?: Partial<AddExpensePayload>) => void;
  closeAddExpenseModal: () => void;
  showToast: (toast: ToastState) => void;
  clearToast: () => void;
};

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  filters: {},
  isAddExpenseOpen: false,
  draftExpense: {},
  toast: null,
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  replaceExpense: (tempId, expense) =>
    set((state) => ({
      expenses: state.expenses.map((item) => (item.id === tempId ? expense : item))
    })),
  setExpenses: (expenses) => set({ expenses }),
  deleteExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id)
    })),
  setCategoryFilter: (category) =>
    set((state) => ({ filters: { ...state.filters, category } })),
  setFilters: (filters) => set({ filters }),
  openAddExpenseModal: (draft = {}) => set({ isAddExpenseOpen: true, draftExpense: draft }),
  closeAddExpenseModal: () => set({ isAddExpenseOpen: false, draftExpense: {} }),
  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null })
}));
