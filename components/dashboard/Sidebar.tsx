"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { Flame, Sparkles, Wallet } from "lucide-react";
import { dashboardNavItems } from "@/components/dashboard/nav-config";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DashboardStats } from "@/lib/dashboard/get-dashboard-stats";
import { jsonFetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data: stats } = useSWR<DashboardStats>("/api/dashboard/stats", jsonFetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false
  });

  const quickStats = [
    { label: t("dashboard.quickBudget"), value: `৳ ${(stats?.monthlyLimit ?? 0).toFixed(0)}` },
    { label: t("dashboard.quickSavings"), value: `৳ ${(stats?.emergencyReserve ?? 0).toFixed(0)}` },
    { label: t("dashboard.quickEntries"), value: String(stats?.entriesToday ?? 0) }
  ];

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-white/50 bg-white/75 px-5 py-6 backdrop-blur xl:flex xl:flex-col xl:gap-6 dark:border-slate-800 dark:bg-slate-950/75">
      <div className="rounded-[28px] bg-gradient-to-br from-primary via-teal-600 to-emerald-500 p-5 text-primary-foreground shadow-xl shadow-teal-900/15">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/20 p-3">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm/5 opacity-85">{t("common.appName")}</p>
            <h2 className="text-xl font-semibold">{t("dashboard.overview")}</h2>
          </div>
        </div>
        <p className="mt-4 text-sm/6 text-primary-foreground/80">{t("dashboard.reportsText")}</p>
      </div>

      <nav className="space-y-2">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-[28px] border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-100 p-5 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-orange-500/10">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <Flame className="h-5 w-5" />
          <h3 className="font-semibold">{t("dashboard.streak")}</h3>
        </div>
        <p className="mt-3 text-3xl font-bold text-amber-950 dark:text-amber-50">
          {stats?.streak ?? 0} <span className="text-base font-medium">{t("dashboard.days")}</span>
        </p>
        <p className="mt-2 text-sm text-amber-900/80 dark:text-amber-100/80">{t("dashboard.streakText")}</p>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950/90">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{t("dashboard.quickStats")}</h3>
        </div>
        <div className="mt-4 space-y-3">
          {quickStats.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl bg-secondary/45 px-3 py-3 dark:bg-slate-900/75"
            >
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
