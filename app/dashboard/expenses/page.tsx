import { ExpensesPageClient } from "@/components/expenses/ExpensesPageClient";
import { createServerComponentClient } from "@/lib/supabase/server";
import { fetchPaginatedExpenses } from "@/lib/supabase/queries";
import { normalizeExpense, type ExpenseQueryFilters } from "@/lib/utils/expenses";

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
      return (
        <ExpensesPageClient
          initialExpenses={[]}
          initialMeta={{
            page: filters.page || 1,
            limit: filters.limit || 20,
            total: 0,
            totalPages: 1,
            hasMore: false,
            totalSpent: 0
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
    return (
      <ExpensesPageClient
        initialExpenses={[]}
        initialMeta={{
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: 0,
          totalPages: 1,
          hasMore: false,
          totalSpent: 0
        }}
      />
    );
  }
}
