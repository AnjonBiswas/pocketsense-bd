"use client";

import { AlertCircle, BellRing, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AlertItem = {
  type: "warning" | "info" | "success";
  title?: string;
  message: string;
};

type AlertsCardProps = {
  alerts: AlertItem[];
};

const alertStyles = {
  warning: {
    icon: AlertCircle,
    className:
      "border-amber-200/70 bg-amber-50 text-amber-950 dark:border-amber-200/70 dark:bg-amber-100/95 dark:text-amber-950"
  },
  info: {
    icon: BellRing,
    className:
      "border-sky-200/70 bg-sky-50 text-sky-950 dark:border-sky-200/70 dark:bg-sky-100/95 dark:text-sky-950"
  },
  success: {
    icon: CheckCircle2,
    className:
      "border-emerald-200/70 bg-emerald-50 text-emerald-950 dark:border-emerald-200/70 dark:bg-emerald-50 dark:text-emerald-950"
  }
} as const;

export function AlertsCard({ alerts }: AlertsCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardHeader>
        <CardTitle className="text-lg">{t("dashboard.smartAlerts")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = alertStyles[alert.type];
          const Icon = config.icon;

          return (
            <div key={alert.message} className={`rounded-2xl border px-4 py-4 ${config.className}`}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  {alert.title ? <p className="text-sm font-semibold">{alert.title}</p> : null}
                  <p className="text-sm/6 font-medium">{alert.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
