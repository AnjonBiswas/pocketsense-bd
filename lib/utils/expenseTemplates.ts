"use client";

export type ExpenseTemplate = {
  id: string;
  title: string;
  amount: number;
  category: string;
  note: string;
  created_at?: string;
};

const STORAGE_KEY = "pocketsense-expense-templates";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getExpenseTemplates() {
  if (!canUseStorage()) {
    return [] as ExpenseTemplate[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ExpenseTemplate[]) : [];
  } catch {
    return [];
  }
}

export function saveExpenseTemplate(template: Omit<ExpenseTemplate, "id">) {
  const current = getExpenseTemplates();
  const next = [
    {
      ...template,
      id: `template-${Date.now()}`
    },
    ...current
  ].slice(0, 8);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function removeExpenseTemplate(id: string) {
  const next = getExpenseTemplates().filter((template) => template.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
