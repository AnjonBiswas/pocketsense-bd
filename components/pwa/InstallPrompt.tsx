"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isRunningAsPWA } from "@/lib/utils/pwa";

const DISMISS_KEY = "pocketsense-install-dismissed-at";
const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<WindowEventMap["beforeinstallprompt"] | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isRunningAsPWA()) {
      return;
    }

    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || "0");
    if (dismissedAt && Date.now() - dismissedAt < SEVEN_DAYS) {
      return;
    }

    const handleInstall = (event: WindowEventMap["beforeinstallprompt"]) => {
      event.preventDefault?.();
      setInstallEvent(event);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);

  if (!visible || !installEvent) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-24 z-[55] rounded-[28px] border border-emerald-200 bg-white/95 p-4 shadow-2xl backdrop-blur md:bottom-6 md:left-auto md:right-6 md:max-w-sm dark:border-slate-700 dark:bg-slate-950/95">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-50">Install PocketSense for better experience</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Faster launch, offline support, and a full-screen app feel on your phone.
          </p>
        </div>
        <button
          type="button"
          className="tap-safe rounded-full p-2 text-muted-foreground transition hover:bg-secondary"
          onClick={() => {
            window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
            setVisible(false);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex gap-3">
        <Button
          type="button"
          className="rounded-full"
          onClick={async () => {
            await installEvent.prompt();
            const choice = await installEvent.userChoice;
            if (choice.outcome === "accepted") {
              setVisible(false);
            }
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Install
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => {
            window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
            setVisible(false);
          }}
        >
          Later
        </Button>
      </div>
    </div>
  );
}
