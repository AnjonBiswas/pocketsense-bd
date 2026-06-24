import { cache } from "react";
import { headers } from "next/headers";
import type { Expense } from "@/store/expenseStore";

export type RecentExpenseResponse = Expense & {
  categoryDetails: {
    en: string;
    bn: string;
    icon: string;
    color: string;
  };
  formattedDate?: string;
};

export const getRecentExpenses = cache(async (limit = 5): Promise<RecentExpenseResponse[]> => {
  const headerStore = headers();
  const host = headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const protocol = forwardedProto || (process.env.NODE_ENV === "development" ? "http" : "https");

  if (!host) {
    throw new Error("Unable to resolve recent expenses host.");
  }

  const response = await fetch(`${protocol}://${host}/api/expenses/recent?limit=${limit}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load recent expenses.");
  }

  return response.json();
});
