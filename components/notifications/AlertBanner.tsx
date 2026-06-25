"use client";

import { useState } from "react";
import { AlertCircle, BellRing, CheckCircle2, XCircle } from "lucide-react";

type AlertBannerProps = {
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
};

const bannerStyles = {
  info: {
    icon: BellRing,
    className: "border-sky-200 bg-sky-50 text-sky-950"
  },
  warning: {
    icon: AlertCircle,
    className: "border-amber-200 bg-amber-50 text-amber-950"
  },
  error: {
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-950"
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-950"
  }
} as const;

export function AlertBanner({ type, title, message }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const config = bannerStyles[type];
  const Icon = config.icon;

  return (
    <div className={`mb-5 rounded-[28px] border px-4 py-4 shadow-sm ${config.className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm leading-6 opacity-90">{message}</p>
          </div>
        </div>
        <button type="button" className="rounded-full p-1 opacity-70 transition hover:bg-white/60 hover:opacity-100" onClick={() => setDismissed(true)}>
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
