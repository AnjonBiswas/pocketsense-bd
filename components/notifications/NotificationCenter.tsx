"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LoaderCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  getNotificationDateGroup,
  type NotificationRecord
} from "@/lib/notifications/notificationService";
import { NotificationItem } from "@/components/notifications/NotificationItem";

type NotificationCenterProps = {
  compact?: boolean;
};

export function NotificationCenter({ compact = false }: NotificationCenterProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function load(seed = false) {
    startTransition(async () => {
      const response = await fetch(`/api/notifications${seed ? "?seed=true" : ""}`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) return;
      setNotifications(payload.notifications || []);
    });
  }

  useEffect(() => {
    load();
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const groupedNotifications = useMemo(() => {
    return notifications.reduce<Record<string, NotificationRecord[]>>((groups, notification) => {
      const key = getNotificationDateGroup(notification.created_at);
      groups[key] = groups[key] ? [...groups[key], notification] : [notification];
      return groups;
    }, {});
  }, [notifications]);

  async function handleOpen(notification: NotificationRecord) {
    await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: notification.id })
    }).catch(() => null);

    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
    );
    setIsOpen(false);
    router.push(notification.action_url || "/dashboard");
    router.refresh();
  }

  async function clearAll() {
    const response = await fetch("/api/notifications", { method: "DELETE" });
    if (!response.ok) return;
    setNotifications([]);
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative rounded-full border border-white/60 bg-white shadow-sm transition hover:bg-secondary/60 dark:border-slate-700 dark:bg-slate-900 ${
            compact ? "p-2.5" : "p-3"
          }`}
        >
          <Bell className="h-5 w-5 text-slate-700 dark:text-slate-100" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] rounded-[28px] p-0 sm:w-[420px]">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <DropdownMenuLabel className="p-0 text-base font-semibold text-slate-900 dark:text-slate-50">
              Notifications
            </DropdownMenuLabel>
            <div className="flex items-center gap-2">
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 rounded-full px-3">
                <Link href="/dashboard/settings/notifications">Settings</Link>
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 rounded-full px-0" onClick={clearAll}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
          </p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
          {isPending && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : null}

          {!notifications.length && !isPending ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-900/80">
              <p className="font-medium text-slate-900">সবকিছু শান্ত আছে</p>
              <p className="mt-1 text-sm text-muted-foreground">নতুন alert এলে এখানে দেখাবে।</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-full dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => load(true)}
              >
                Generate sample alerts
              </Button>
            </div>
          ) : null}

          <div className="space-y-5">
            {Object.entries(groupedNotifications).map(([group, items], index) => (
              <div key={group}>
                {index > 0 ? <DropdownMenuSeparator className="my-4" /> : null}
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {group}
                </p>
                <div className="space-y-3">
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onOpen={handleOpen}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
