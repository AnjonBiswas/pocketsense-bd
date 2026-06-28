import {
  endOfMonth,
  endOfWeek,
  format,
  isThisMonth,
  isThisWeek,
  isToday,
  isYesterday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import type { Expense } from "@/store/expenseStore";
import type { Language } from "@/lib/i18n/translations";

export type ExpenseQueryFilters = {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
};

export const FALLBACK_EXPENSES: Expense[] = [
  {
    id: "preview-expense-1",
    amount: 120,
    category: "cafe",
    note: "Milk tea with friends",
    date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString()
  },
  {
    id: "preview-expense-2",
    amount: 250,
    category: "food",
    note: "Lunch at campus canteen",
    date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString()
  },
  {
    id: "preview-expense-3",
    amount: 60,
    category: "transport",
    note: "Bus fare",
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "preview-expense-4",
    amount: 299,
    category: "mobile",
    note: "Internet recharge",
    date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "preview-expense-5",
    amount: 180,
    category: "entertainment",
    note: "Movie ticket",
    date: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: "preview-expense-6",
    amount: 500,
    category: "health",
    note: "Pharmacy",
    date: new Date(Date.now() - 12 * 86400000).toISOString().slice(0, 10),
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  }
];

export function normalizeExpense(expense: Record<string, unknown>): Expense {
  return {
    id: String(expense.id),
    amount: Number(expense.amount),
    category: String(expense.category),
    note: typeof expense.note === "string" ? expense.note : null,
    date: String(expense.date),
    created_at: String(expense.created_at)
  };
}

export function applyExpenseFilters(expenses: Expense[], filters: ExpenseQueryFilters) {
  return expenses.filter((expense) => {
    if (filters.startDate && expense.date < filters.startDate) return false;
    if (filters.endDate && expense.date > filters.endDate) return false;
    if (filters.categories?.length && !filters.categories.includes(expense.category)) return false;
    if (typeof filters.minAmount === "number" && expense.amount < filters.minAmount) return false;
    if (typeof filters.maxAmount === "number" && expense.amount > filters.maxAmount) return false;

    if (filters.search) {
      const query = filters.search.trim().toLowerCase();
      const text = `${expense.note || ""} ${expense.category}`.toLowerCase();
      if (!text.includes(query)) return false;
    }

    return true;
  });
}

export function paginateExpenses(expenses: Expense[], page = 1, limit = 10) {
  const start = (page - 1) * limit;
  const paginated = expenses.slice(start, start + limit);

  return {
    data: paginated,
    page,
    limit,
    total: expenses.length,
    totalPages: Math.max(Math.ceil(expenses.length / limit), 1),
    hasMore: start + limit < expenses.length
  };
}

export function getPresetRange(preset: "thisWeek" | "thisMonth" | "lastMonth" | "custom") {
  const today = new Date();

  if (preset === "thisWeek") {
    return {
      startDate: format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      endDate: format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
    };
  }

  if (preset === "lastMonth") {
    const lastMonth = subMonths(today, 1);
    return {
      startDate: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
      endDate: format(endOfMonth(lastMonth), "yyyy-MM-dd")
    };
  }

  if (preset === "thisMonth") {
    return {
      startDate: format(startOfMonth(today), "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd")
    };
  }

  return {
    startDate: "",
    endDate: ""
  };
}

export function getExpenseGroupLabel(dateString: string, language: Language = "en") {
  const date = parseISO(dateString);

  if (isToday(date)) return language === "bn" ? "আজ" : "Today";
  if (isYesterday(date)) return language === "bn" ? "গতকাল" : "Yesterday";
  if (isThisWeek(date, { weekStartsOn: 1 })) return language === "bn" ? "এই সপ্তাহ" : "This week";
  if (isThisMonth(date)) return language === "bn" ? "এই মাস" : "This month";

  return format(date, "MMMM d, yyyy");
}

export function groupExpensesForDisplay(expenses: Expense[], language: Language = "en") {
  return expenses.reduce<Record<string, Expense[]>>((accumulator, expense) => {
    const label = getExpenseGroupLabel(expense.date, language);
    accumulator[label] = [...(accumulator[label] || []), expense];
    return accumulator;
  }, {});
}
