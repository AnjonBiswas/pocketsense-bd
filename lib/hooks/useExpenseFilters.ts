"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getPresetRange } from "@/lib/utils/expenses";

export type FilterPreset = "thisWeek" | "thisMonth" | "lastMonth" | "custom";

export type ExpenseFilterState = {
  preset: FilterPreset;
  startDate: string;
  endDate: string;
  categories: string[];
  minAmount: string;
  maxAmount: string;
  search: string;
  page: number;
  limit: number;
};

function detectPreset(startDate: string, endDate: string): FilterPreset {
  const presets: FilterPreset[] = ["thisWeek", "thisMonth", "lastMonth"];

  for (const preset of presets) {
    const range = getPresetRange(preset);
    if (range.startDate === startDate && range.endDate === endDate) {
      return preset;
    }
  }

  return "custom";
}

export function useExpenseFilters(defaultLimit = 20) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<ExpenseFilterState>(() => {
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    return {
      preset: startDate || endDate ? detectPreset(startDate, endDate) : "thisMonth",
      startDate,
      endDate,
      categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
      minAmount: searchParams.get("minAmount") || "",
      maxAmount: searchParams.get("maxAmount") || "",
      search: searchParams.get("search") || "",
      page: Number(searchParams.get("page") || "1"),
      limit: Number(searchParams.get("limit") || String(defaultLimit))
    };
  }, [defaultLimit, searchParams]);

  const [draft, setDraft] = useState<ExpenseFilterState>(() => {
    if (state.startDate || state.endDate) {
      return state;
    }

    const range = getPresetRange("thisMonth");
    return { ...state, preset: "thisMonth", ...range };
  });
  const stateSignature = useMemo(() => JSON.stringify(state), [state]);
  const draftSignature = useMemo(() => JSON.stringify(draft), [draft]);

  useEffect(() => {
    if (
      stateSignature !== draftSignature &&
      (state.startDate ||
        state.endDate ||
        state.categories.length ||
        state.search ||
        state.minAmount ||
        state.maxAmount ||
        state.page > 1)
    ) {
      setDraft(state);
    }
  }, [draftSignature, state, stateSignature]);

  const syncToUrl = (nextState: ExpenseFilterState) => {
    const params = new URLSearchParams();

    if (nextState.startDate) params.set("startDate", nextState.startDate);
    if (nextState.endDate) params.set("endDate", nextState.endDate);
    if (nextState.categories.length) params.set("categories", nextState.categories.join(","));
    if (nextState.minAmount) params.set("minAmount", nextState.minAmount);
    if (nextState.maxAmount) params.set("maxAmount", nextState.maxAmount);
    if (nextState.search) params.set("search", nextState.search);
    if (nextState.page > 1) params.set("page", String(nextState.page));
    if (nextState.limit !== defaultLimit) params.set("limit", String(nextState.limit));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const applyFilters = (partial?: Partial<ExpenseFilterState>) => {
    const nextState = {
      ...draft,
      ...partial,
      page: partial?.page ?? 1
    };

    setDraft(nextState);
    syncToUrl(nextState);
  };

  const resetFilters = () => {
    const range = getPresetRange("thisMonth");
    const nextState: ExpenseFilterState = {
      preset: "thisMonth",
      startDate: range.startDate,
      endDate: range.endDate,
      categories: [],
      minAmount: "",
      maxAmount: "",
      search: "",
      page: 1,
      limit: defaultLimit
    };

    setDraft(nextState);
    syncToUrl(nextState);
  };

  const setPreset = (preset: FilterPreset) => {
    const range = preset === "custom" ? { startDate: draft.startDate, endDate: draft.endDate } : getPresetRange(preset);
    setDraft((current) => ({ ...current, preset, ...range }));
  };

  return {
    filters: state.startDate || state.endDate ? state : draft,
    draft,
    setDraft,
    setPreset,
    applyFilters,
    resetFilters,
    exportQuery: useMemo(() => {
      const params = new URLSearchParams();
      const source = state.startDate || state.endDate ? state : draft;

      if (source.startDate) params.set("startDate", source.startDate);
      if (source.endDate) params.set("endDate", source.endDate);
      if (source.categories.length) params.set("categories", source.categories.join(","));
      if (source.minAmount) params.set("minAmount", source.minAmount);
      if (source.maxAmount) params.set("maxAmount", source.maxAmount);
      if (source.search) params.set("search", source.search);

      return params.toString();
    }, [draft, state])
  };
}
