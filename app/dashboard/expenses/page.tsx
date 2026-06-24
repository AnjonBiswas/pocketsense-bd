import { ExpensesPageClient } from "@/components/expenses/ExpensesPageClient";
import { createServerComponentClient } from "@/lib/supabase/server";
import { FALLBACK_EXPENSES, applyExpenseFilters, normalizeExpense, paginateExpenses, type ExpenseQueryFilters } from "@/lib/utils/expenses";

type ExpensesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function parseSearchParams(searchParams?: Record<string, string | string[] | undefined>): ExpenseQueryFilters {
  const getValue = (key: string) => {
    const value = searchParams?.[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    startDate: getValue("startDate"),
    endDate: getValue("endDate"),
    categories: getValue("categories")?.split(",").filter(Boolean),
    minAmount: getValue("minAmount") ? Number(getValue("minAmount")) : undefined,
    maxAmount: getValue("maxAmount") ? Number(getValue("maxAmount")) : undefined,
    search: getValue("search"),
    page: getValue("page") ? Number(getValue("page")) : 1,
    limit: getValue("limit") ? Number(getValue("limit")) : 10
  };
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const filters = parseSearchParams(searchParams);

  try {
    const supabase = createServerComponentClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const filtered = applyExpenseFilters(FALLBACK_EXPENSES, filters);
      const paginated = paginateExpenses(filtered, filters.page, filters.limit);

      return (
        <ExpensesPageClient
          initialExpenses={paginated.data}
          initialMeta={{
            page: paginated.page,
            limit: paginated.limit,
            total: paginated.total,
            totalPages: paginated.totalPages,
            hasMore: paginated.hasMore,
            totalSpent: filtered.reduce((sum, expense) => sum + expense.amount, 0)
          }}
        />
      );
    }

    let query = supabase
      .from("expenses")
      .select("id, amount, category, note, date, created_at", { count: "exact" })
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters.startDate) query = query.gte("date", filters.startDate);
    if (filters.endDate) query = query.lte("date", filters.endDate);
    if (filters.categories?.length) query = query.in("category", filters.categories);
    if (typeof filters.minAmount === "number") query = query.gte("amount", filters.minAmount);
    if (typeof filters.maxAmount === "number") query = query.lte("amount", filters.maxAmount);
    if (filters.search) query = query.ilike("note", `%${filters.search}%`);

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await query.range(from, to);
    const normalized = (data || []).map((expense) => normalizeExpense(expense));
    let totalQuery = supabase.from("expenses").select("amount").eq("user_id", user.id);

    if (filters.startDate) totalQuery = totalQuery.gte("date", filters.startDate);
    if (filters.endDate) totalQuery = totalQuery.lte("date", filters.endDate);
    if (filters.categories?.length) totalQuery = totalQuery.in("category", filters.categories);
    if (typeof filters.minAmount === "number") totalQuery = totalQuery.gte("amount", filters.minAmount);
    if (typeof filters.maxAmount === "number") totalQuery = totalQuery.lte("amount", filters.maxAmount);
    if (filters.search) totalQuery = totalQuery.ilike("note", `%${filters.search}%`);

    const { data: totalRows } = await totalQuery;
    const totalSpent = (totalRows || []).reduce((sum, expense) => sum + Number(expense.amount), 0);

    return (
      <ExpensesPageClient
        initialExpenses={normalized}
        initialMeta={{
          page,
          limit,
          total: count || normalized.length,
          totalPages: Math.max(Math.ceil((count || normalized.length) / limit), 1),
          hasMore: from + limit < (count || normalized.length),
          totalSpent
        }}
      />
    );
  } catch {
    const filtered = applyExpenseFilters(FALLBACK_EXPENSES, filters);
    const paginated = paginateExpenses(filtered, filters.page, filters.limit);

    return (
      <ExpensesPageClient
        initialExpenses={paginated.data}
        initialMeta={{
          page: paginated.page,
          limit: paginated.limit,
          total: paginated.total,
          totalPages: paginated.totalPages,
          hasMore: paginated.hasMore,
          totalSpent: filtered.reduce((sum, expense) => sum + expense.amount, 0)
        }}
      />
    );
  }
}
