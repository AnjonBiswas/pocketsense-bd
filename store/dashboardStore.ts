import { create } from "zustand";
import type { DashboardStats } from "@/lib/dashboard/get-dashboard-stats";

type DashboardStore = {
  stats: DashboardStats | null;
  setStats: (stats: DashboardStats) => void;
  clearStats: () => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
  clearStats: () => set({ stats: null })
}));

