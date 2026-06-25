"use client";

import { useEffect, useState } from "react";
import { AlertBanner } from "@/components/notifications/AlertBanner";
import type { NotificationRecord } from "@/lib/notifications/notificationService";

export function NotificationBannerShell() {
  const [notification, setNotification] = useState<NotificationRecord | null>(null);

  useEffect(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        const firstUnread = (payload?.notifications || []).find(
          (item: NotificationRecord) => !item.read
        );
        setNotification(firstUnread || null);
      })
      .catch(() => null);
  }, []);

  if (!notification) {
    return null;
  }

  const bannerType =
    notification.type === "overspending" || notification.type === "bill_due" || notification.type === "sos"
      ? "warning"
      : notification.type === "challenge_completion" || notification.type === "streak_milestone"
        ? "success"
        : "info";

  return <AlertBanner type={bannerType} title={notification.title} message={notification.message} />;
}
