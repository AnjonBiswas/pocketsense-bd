"use client";

import {
  BellRing,
  CalendarClock,
  CircleAlert,
  CircleDollarSign,
  Flame,
  GraduationCap,
  ShieldAlert,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNotificationTimeAgo, type NotificationRecord } from "@/lib/notifications/notificationService";

type NotificationItemProps = {
  notification: NotificationRecord;
  onOpen: (notification: NotificationRecord) => Promise<void> | void;
};

const typeConfig = {
  daily_budget: {
    icon: CircleDollarSign,
    className: "bg-sky-50 text-sky-700 border-sky-200"
  },
  overspending: {
    icon: CircleAlert,
    className: "bg-amber-50 text-amber-700 border-amber-200"
  },
  bill_due: {
    icon: CalendarClock,
    className: "bg-orange-50 text-orange-700 border-orange-200"
  },
  tuition: {
    icon: GraduationCap,
    className: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  friend_owed: {
    icon: BellRing,
    className: "bg-teal-50 text-teal-700 border-teal-200"
  },
  challenge_completion: {
    icon: Trophy,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  streak_milestone: {
    icon: Flame,
    className: "bg-rose-50 text-rose-700 border-rose-200"
  },
  month_end_summary: {
    icon: BellRing,
    className: "bg-violet-50 text-violet-700 border-violet-200"
  },
  sos: {
    icon: ShieldAlert,
    className: "bg-red-50 text-red-700 border-red-200"
  },
  info: {
    icon: BellRing,
    className: "bg-slate-50 text-slate-700 border-slate-200"
  }
} as const;

export function NotificationItem({ notification, onOpen }: NotificationItemProps) {
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`rounded-[24px] border px-4 py-4 transition ${
        notification.read ? "bg-white/70" : "bg-white shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-2xl border p-3 ${config.className}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
            </div>
            {!notification.read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{formatNotificationTimeAgo(notification.created_at)}</p>
            <Button type="button" size="sm" variant="ghost" className="h-8 rounded-full px-3" onClick={() => onOpen(notification)}>
              Open
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
