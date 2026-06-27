"use client";

import { useState } from "react";
import { AlertCircle, BellRing, CheckCircle2, XCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type AlertBannerProps = {
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
};

const bannerStyles = {
  info: {
    icon: BellRing,
    className: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-200/70 dark:bg-sky-100/95 dark:text-sky-900",
    titleClassName: "text-sky-900 dark:text-sky-900",
    messageClassName: "text-sky-800/90 dark:text-sky-800/90"
  },
  warning: {
    icon: AlertCircle,
    className:
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-200/70 dark:bg-amber-100/95 dark:text-amber-950",
    titleClassName: "",
    messageClassName: ""
  },
  error: {
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-950 dark:border-red-500/20 dark:bg-red-500/18 dark:text-red-200",
    titleClassName: "",
    messageClassName: ""
  },
  success: {
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-200/70 dark:bg-emerald-50 dark:text-emerald-900",
    titleClassName: "dark:text-emerald-950",
    messageClassName: "dark:text-emerald-900/90"
  }
} as const;

export function AlertBanner({ type, title, message }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { resolvedTheme } = useTheme();

  if (dismissed) {
    return null;
  }

  const config = bannerStyles[type];
  const Icon = config.icon;
  const infoDarkMode = type === "info" && resolvedTheme === "dark";
  const successDarkMode = type === "success" && resolvedTheme === "dark";

  return (
    <div
      className={`mb-5 rounded-[28px] border px-4 py-4 shadow-sm ${config.className}`}
      style={
        infoDarkMode
          ? { backgroundColor: "#e0f2fe", borderColor: "#58b5e0", color: "#1d6f9f" }
          : successDarkMode
            ? { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" }
            : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p
              className={`font-semibold ${config.titleClassName}`}
              style={infoDarkMode ? { color: "#0f172a" } : successDarkMode ? { color: "#017355" } : undefined}
            >
              {title}
            </p>
            <p
              className={`mt-1 text-sm leading-6 opacity-90 ${config.messageClassName}`}
              style={infoDarkMode ? { color: "#44a1c4" } : successDarkMode ? { color: "#065f46" } : undefined}
            >
              {message}
            </p>
          </div>
        </div>
        <button type="button" className="rounded-full p-1 opacity-70 transition hover:bg-white/60 hover:opacity-100" onClick={() => setDismissed(true)}>
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
