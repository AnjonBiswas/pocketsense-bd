import type { NextRequest } from "next/server";
import type { createRouteHandlerClient } from "@/lib/supabase/server";

export type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  totalSpent: number;
};

export type ExpenseListQueryFilters = {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
};

export function parsePaginationParams(request: NextRequest, defaultLimit = 20) {
  const page = Math.max(Number(request.nextUrl.searchParams.get("page") || "1"), 1);
  const limit = Math.max(Number(request.nextUrl.searchParams.get("limit") || String(defaultLimit)), 1);

  return {
    page,
    limit,
    from: (page - 1) * limit,
    to: (page - 1) * limit + limit - 1
  };
}

export function applyExpenseFiltersToQuery<TQuery extends {
  gte: (column: string, value: string | number) => TQuery;
  lte: (column: string, value: string | number) => TQuery;
  in: (column: string, value: string[]) => TQuery;
  ilike: (column: string, value: string) => TQuery;
}>(
  query: TQuery,
  filters: ExpenseListQueryFilters
) {
  let nextQuery = query;

  if (filters.startDate) nextQuery = nextQuery.gte("date", filters.startDate);
  if (filters.endDate) nextQuery = nextQuery.lte("date", filters.endDate);
  if (filters.categories?.length) nextQuery = nextQuery.in("category", filters.categories);
  if (typeof filters.minAmount === "number") nextQuery = nextQuery.gte("amount", filters.minAmount);
  if (typeof filters.maxAmount === "number") nextQuery = nextQuery.lte("amount", filters.maxAmount);
  if (filters.search) nextQuery = nextQuery.ilike("note", `%${filters.search}%`);

  return nextQuery;
}

export async function fetchPaginatedExpenses(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  userId: string,
  filters: ExpenseListQueryFilters
) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("expenses")
    .select("id, amount, category, note, date, created_at", { count: "exact" })
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  query = applyExpenseFiltersToQuery(query, filters);
  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  let totalQuery = supabase.from("expenses").select("amount").eq("user_id", userId);
  totalQuery = applyExpenseFiltersToQuery(totalQuery, filters);
  const { data: totalRows } = await totalQuery;
  const totalSpent = (totalRows || []).reduce((sum, row) => sum + Number(row.amount), 0);

  return {
    data: data || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.max(Math.ceil((count || 0) / limit), 1),
      hasMore: from + limit < (count || 0),
      totalSpent
    } satisfies PaginatedMeta
  };
}
