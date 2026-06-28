"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertBanner } from "@/components/notifications/AlertBanner";

type DashboardStatsPayload = {
  dailyBudget: number;
  alerts: Array<{
    type: "warning" | "info" | "success";
    title?: string;
    message: string;
  }>;
};

export function NotificationBannerShell() {
  const { t } = useLanguage();
  const [banner, setBanner] = useState<{
    type: "info" | "warning" | "error" | "success";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: DashboardStatsPayload) => {
        if (payload?.dailyBudget > 0) {
          setBanner({
            type: "info",
            title: t("dashboard.budgetReminderTitle"),
            message: t("dashboard.budgetReminderMessage").replace("{{amount}}", payload.dailyBudget.toFixed(0))
          });
          return;
        }

        const firstAlert = payload?.alerts?.[0];

        if (!firstAlert) {
          setBanner(null);
          return;
        }

        setBanner({
          type: firstAlert.type,
          title: firstAlert.title || t("dashboard.updateTitle"),
          message: firstAlert.message
        });
      })
      .catch(() => setBanner(null));
  }, [t]);

  if (!banner) {
    return null;
  }

  return <AlertBanner type={banner.type} title={banner.title} message={banner.message} />;
}
