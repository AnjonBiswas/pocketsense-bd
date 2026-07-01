"use client";

import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertBanner } from "@/components/notifications/AlertBanner";
import { useDashboardStore } from "@/store/dashboardStore";

export function NotificationBannerShell() {
  const { t } = useLanguage();
  const stats = useDashboardStore((state) => state.stats);
  const banner = useMemo(() => {
    if (!stats) {
      return null;
    }

    if (stats.dailyBudget > 0) {
      return {
        type: "info" as const,
        title: t("dashboard.budgetReminderTitle"),
        message: t("dashboard.budgetReminderMessage").replace("{{amount}}", stats.dailyBudget.toFixed(0))
      };
    }

    const firstAlert = stats.alerts?.[0];
    if (!firstAlert) {
      return null;
    }

    return {
      type: firstAlert.type,
      title: firstAlert.title || t("dashboard.updateTitle"),
      message: firstAlert.message
    };
  }, [stats, t]);

  if (!banner) {
    return null;
  }

  return <AlertBanner type={banner.type} title={banner.title} message={banner.message} />;
}
