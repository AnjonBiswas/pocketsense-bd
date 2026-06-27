"use client";

import dynamic from "next/dynamic";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition
} from "react";
import { Download, RefreshCcw, Search, Trash2 } from "lucide-react";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseListItem } from "@/components/expenses/ExpenseListItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useExpenseFilters } from "@/lib/hooks/useExpenseFilters";
import { groupExpensesForDisplay } from "@/lib/utils/expenses";
import type { Expense } from "@/store/expenseStore";

const EditExpenseModal = dynamic(
  () => import("@/components/expenses/EditExpenseModal").then((module) => module.EditExpenseModal),
  {
    ssr: false
  }
);

type ExpensesPageClientProps = {
  initialExpenses: Expense[];
  initialMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    totalSpent: number;
  };
};

export function ExpensesPageClient({ initialExpenses, initialMeta }: ExpensesPageClientProps) {
  const { filters, draft, setDraft, setPreset, applyFilters, resetFilters, exportQuery } = useExpenseFilters(
    initialMeta.limit || 20
  );
  const deferredSearch = useDeferredValue(filters.search);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [meta, setMeta] = useState(initialMeta);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isRefreshing, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const categoriesKey = filters.categories.join(",");

  const loadExpenses = (mode: "replace" | "append" = "replace", pageOverride?: number) => {
    if (mode === "append") {
      setIsLoadingMore(true);
    }

    startTransition(async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.categories.length) params.set("categories", filters.categories.join(","));
      if (filters.minAmount) params.set("minAmount", filters.minAmount);
      if (filters.maxAmount) params.set("maxAmount", filters.maxAmount);
      if (deferredSearch) params.set("search", deferredSearch);
      params.set("page", String(pageOverride ?? filters.page));
      params.set("limit", String(filters.limit));

      const response = await fetch(`/api/expenses?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        setIsLoadingMore(false);
        return;
      }

      setExpenses((current) => {
        const nextItems = payload.expenses || [];
        if (mode === "append") {
          const seen = new Set(current.map((expense: Expense) => expense.id));
          return [...current, ...nextItems.filter((expense: Expense) => !seen.has(expense.id))];
        }
        return nextItems;
      });
      setMeta(payload.meta || initialMeta);

      if (mode === "replace") {
        setSelectedIds([]);
      }

      setIsLoadingMore(false);
    });
  };

  useEffect(() => {
    loadExpenses(filters.page > 1 ? "append" : "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.startDate,
    filters.endDate,
    categoriesKey,
    filters.minAmount,
    filters.maxAmount,
    filters.page,
    filters.limit,
    deferredSearch
  ]);

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node || !meta.hasMore || isRefreshing || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (!entry?.isIntersecting || isLoadingMore || isRefreshing || !meta.hasMore) {
          return;
        }

        applyFilters({ page: meta.page + 1 });
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [applyFilters, isLoadingMore, isRefreshing, meta.hasMore, meta.page]);

  const groupedExpenses = useMemo(() => groupExpensesForDisplay(expenses), [expenses]);
  const allSelected = expenses.length > 0 && selectedIds.length === expenses.length;

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) return;

    setExpenses((current) => current.filter((expense) => expense.id !== id));
    setSelectedIds((current) => current.filter((item) => item !== id));
    loadExpenses("replace");
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    const response = await fetch(`/api/expenses?ids=${selectedIds.join(",")}`, {
      method: "DELETE"
    });

    if (!response.ok) return;

    setExpenses((current) => current.filter((expense) => !selectedIds.includes(expense.id)));
    setSelectedIds([]);
    loadExpenses("replace");
  };

  return (
    <section
      className="space-y-5"
      onTouchStart={(event) => {
        if (window.scrollY === 0) setTouchStartY(event.touches[0].clientY);
      }}
      onTouchMove={(event) => {
        if (touchStartY === null || window.scrollY > 0) return;
        const delta = event.touches[0].clientY - touchStartY;
        setPullDistance(Math.max(Math.min(delta, 80), 0));
      }}
      onTouchEnd={() => {
        if (pullDistance > 60) {
          loadExpenses("replace");
        }
        setTouchStartY(null);
        setPullDistance(0);
      }}
    >
      <div className="flex justify-center">
        <div
          className={`rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition ${
            pullDistance > 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          {pullDistance > 60 ? "Release to refresh" : "Pull to refresh"}
        </div>
      </div>

      <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl">Expense list</CardTitle>
              <CardDescription>All your spending, filters, exports, and quick cleanup in one place.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <ExpenseFilters
                draft={draft}
                setDraft={setDraft}
                setPreset={setPreset}
                onApply={() => applyFilters()}
                onReset={resetFilters}
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => loadExpenses("replace")}
                disabled={isRefreshing}
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <a href={`/api/expenses/export${exportQuery ? `?${exportQuery}` : ""}`}>
                <Button type="button" variant="outline" className="rounded-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </a>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.2fr_auto_auto]">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={draft.search}
                  onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      applyFilters({ search: draft.search });
                    }
                  }}
                  placeholder="Search by note"
                  className="pl-11"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => applyFilters({ search: draft.search })}
              >
                Search
              </Button>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border dark:border-emerald-200/70 dark:bg-emerald-100/95 dark:text-emerald-950">
              Total spent: ৳{meta.totalSpent.toFixed(0)}
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!selectedIds.length}
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete selected ({selectedIds.length})
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(event) =>
                setSelectedIds(event.target.checked ? expenses.map((expense) => expense.id) : [])
              }
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            Select all on this page
          </label>

          {isRefreshing ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-[28px] border border-white/50 bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : null}

          {!isRefreshing && expenses.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/75">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-sm dark:bg-slate-950 dark:text-slate-50">
                🧾
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">No expenses yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your first expense and PocketSense will group everything here by time.
              </p>
            </div>
          ) : null}

          {!isRefreshing &&
            Object.entries(groupedExpenses).map(([group, items]) => (
              <div key={group} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{group}</h2>
                  <p className="text-xs text-muted-foreground">
                    ৳{items.reduce((sum, expense) => sum + expense.amount, 0).toFixed(0)}
                  </p>
                </div>
                <div className="space-y-3">
                  {items.map((expense) => (
                    <ExpenseListItem
                      key={expense.id}
                      expense={expense}
                      selected={selectedIds.includes(expense.id)}
                      onSelect={(checked) =>
                        setSelectedIds((current) =>
                          checked ? [...current, expense.id] : current.filter((item) => item !== expense.id)
                        )
                      }
                      onDelete={() => handleDelete(expense.id)}
                      onEdit={() => setEditingExpense(expense)}
                    />
                  ))}
                </div>
              </div>
            ))}

          <div className="flex flex-col gap-3 rounded-[28px] bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900/75">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages} • {meta.total} expenses
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={!meta.hasMore || isLoadingMore}
                onClick={() => {
                  applyFilters({ page: meta.page + 1 });
                }}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
            </div>
          </div>

          <div ref={loadMoreRef} className="h-4 w-full" />
        </CardContent>
      </Card>

      <EditExpenseModal
        expense={editingExpense}
        open={Boolean(editingExpense)}
        onOpenChange={(open) => {
          if (!open) setEditingExpense(null);
        }}
        onUpdated={(updatedExpense) => {
          setExpenses((current) =>
            current.map((expense) => (expense.id === updatedExpense.id ? updatedExpense : expense))
          );
          setEditingExpense(null);
          loadExpenses("replace");
        }}
      />
    </section>
  );
}
