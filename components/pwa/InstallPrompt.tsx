"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isRunningAsPWA } from "@/lib/utils/pwa";

const TRIGGER_COOKIE = "pocketsense_install_prompt=1";
const COOLDOWN_STORAGE_KEY = "pocketsense_install_prompt_hidden_until";
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export function InstallPrompt() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<WindowEventMap["beforeinstallprompt"] | null>(null);
  const [visible, setVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  function hideForCooldown() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(COOLDOWN_STORAGE_KEY, String(Date.now() + TWO_DAYS_MS));
    setIsCoolingDown(true);
    setVisible(false);
  }

  useEffect(() => {
    if (isRunningAsPWA()) {
      return;
    }

    const handleInstall = (event: WindowEventMap["beforeinstallprompt"]) => {
      event.preventDefault?.();
      setInstallEvent(event);
    };

    const refreshEligibility = () => {
      setShouldShow(document.cookie.includes(TRIGGER_COOKIE));
      const hiddenUntil = Number(window.localStorage.getItem(COOLDOWN_STORAGE_KEY) || 0);
      setIsCoolingDown(Number.isFinite(hiddenUntil) && hiddenUntil > Date.now());
    };

    refreshEligibility();
    window.addEventListener("beforeinstallprompt", handleInstall);
    window.addEventListener("pocketsense-auth-success", refreshEligibility);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstall);
      window.removeEventListener("pocketsense-auth-success", refreshEligibility);
    };
  }, []);

  useEffect(() => {
    if (isRunningAsPWA() || isCoolingDown || !shouldShow || !pathname.startsWith("/dashboard") || !installEvent) {
      return;
    }

    setVisible(true);
    document.cookie = "pocketsense_install_prompt=; path=/; max-age=0; samesite=lax";
  }, [installEvent, isCoolingDown, pathname, shouldShow]);

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
          className="tap-safe flex h-10 w-10 items-center justify-center rounded-full p-0 text-muted-foreground transition hover:bg-secondary"
          onClick={() => {
            hideForCooldown();
          }}
        >
          <X className="h-4 w-4 shrink-0" />
        </button>
      </div>
      <div className="mt-4 flex gap-3">
        <Button
          type="button"
          className="rounded-full"
          onClick={async () => {
            await installEvent.prompt();
            const choice = await installEvent.userChoice;
            hideForCooldown();
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
            hideForCooldown();
          }}
        >
          Later
        </Button>
      </div>
    </div>
  );
}
