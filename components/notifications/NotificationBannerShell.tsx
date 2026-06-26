"use client";

import { useEffect, useState } from "react";
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
            title: "আজকের বাজেট রিমাইন্ডার",
            message: `আজ নিরাপদ খরচ সীমা প্রায় ৳${payload.dailyBudget.toFixed(0)}।`
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
          title: firstAlert.title || "PocketSense update",
          message: firstAlert.message
        });
      })
      .catch(() => setBanner(null));
  }, []);

  if (!banner) {
    return null;
  }

  return <AlertBanner type={banner.type} title={banner.title} message={banner.message} />;
}
