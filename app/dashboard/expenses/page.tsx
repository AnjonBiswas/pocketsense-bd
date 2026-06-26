import { ExpensesPageClient } from "@/components/expenses/ExpensesPageClient";
import { createServerComponentClient } from "@/lib/supabase/server";
import { fetchPaginatedExpenses } from "@/lib/supabase/queries";
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
    limit: getValue("limit") ? Number(getValue("limit")) : 20
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

    const result = await fetchPaginatedExpenses(supabase, user.id, filters);

    return (
      <ExpensesPageClient
        initialExpenses={result.data.map((expense) => normalizeExpense(expense))}
        initialMeta={result.meta}
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
