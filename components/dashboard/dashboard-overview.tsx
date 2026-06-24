"use client";

import { CalendarDays, PiggyBank, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardOverview() {
  const { t } = useLanguage();
  const stats = [
    {
      title: t("dashboard.budgetLeft"),
      value: "৳8,500",
      change: "18% buffer remaining",
      icon: PiggyBank,
      accent: "bg-emerald-100 text-emerald-900"
    },
    {
      title: t("dashboard.weeklySpend"),
      value: "৳1,250",
      change: "Food + transport lead",
      icon: TrendingUp,
      accent: "bg-orange-100 text-orange-900"
    },
    {
      title: t("dashboard.savingsGoal"),
      value: "৳2,200",
      change: "Steady this month",
      icon: TrendingDown,
      accent: "bg-sky-100 text-sky-900"
    }
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-[0_24px_80px_rgba(13,148,136,0.22)]">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              {t("dashboard.overview")}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/80">{t("common.welcome")}</p>
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
                {t("dashboard.reportsTitle")}
              </h1>
              <p className="max-w-xl text-sm/6 text-white/80 md:text-base">{t("dashboard.reportsText")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/12 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">{t("dashboard.streak")}</p>
                <p className="mt-1 text-xl font-semibold">
                  5 {t("dashboard.days")}
                </p>
              </div>
              <div className="rounded-2xl bg-white/12 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">{t("dashboard.quickEntries")}</p>
                <p className="mt-1 text-xl font-semibold">12</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("dashboard.today")}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              <CalendarDays className="h-4 w-4" />
              {format(new Date(), "MMMM d, yyyy")}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 p-4">
              <p className="text-sm font-semibold text-orange-950">{t("dashboard.dailyTip")}</p>
              <p className="mt-2 text-sm/6 text-orange-900/80">{t("dashboard.dailyTipText")}</p>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-100 p-4">
              <p className="text-sm font-semibold text-cyan-950">{t("dashboard.campusPulse")}</p>
              <p className="mt-2 text-sm/6 text-cyan-900/80">{t("dashboard.campusPulseText")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="overflow-hidden border-white/60 bg-white/85 shadow-sm backdrop-blur"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardDescription>{item.title}</CardDescription>
                  <CardTitle className="mt-2 text-2xl">{item.value}</CardTitle>
                </div>
                <div className={`rounded-2xl p-3 ${item.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SpendingChart />
        <Card className="border-white/60 bg-white/85 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>{t("dashboard.quickStats")}</CardTitle>
            <CardDescription>{t("dashboard.streakText")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-secondary/60 px-4 py-4">
              <p className="text-sm text-muted-foreground">{t("dashboard.quickBudget")}</p>
              <p className="mt-1 text-xl font-semibold">৳12,000</p>
            </div>
            <div className="rounded-2xl bg-secondary/60 px-4 py-4">
              <p className="text-sm text-muted-foreground">{t("dashboard.quickSavings")}</p>
              <p className="mt-1 text-xl font-semibold">৳3,400</p>
            </div>
            <div className="rounded-2xl bg-secondary/60 px-4 py-4">
              <p className="text-sm text-muted-foreground">{t("dashboard.quickEntries")}</p>
              <p className="mt-1 text-xl font-semibold">12</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
