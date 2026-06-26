import { cache } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { headers } from "next/headers";
import type { Expense } from "@/store/expenseStore";

export const getDashboardExpenses = cache(async (): Promise<Expense[]> => {
  const headerStore = headers();
  const host = headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const cookie = headerStore.get("cookie") || "";
  const protocol = forwardedProto || (process.env.NODE_ENV === "development" ? "http" : "https");

  if (!host) {
    return [];
  }

  const today = new Date();
  const startDate = startOfMonth(today).toISOString().slice(0, 10);
  const endDate = endOfMonth(today).toISOString().slice(0, 10);

  try {
    const response = await fetch(
      `${protocol}://${host}/api/expenses?startDate=${startDate}&endDate=${endDate}`,
      {
        cache: "no-store",
        headers: {
          cookie
        }
      }
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.expenses || [];
  } catch {
    return [];
  }
});
