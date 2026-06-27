"use client";

import { useEffect, useState } from "react";
import { CloudOff, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { flushPendingActions, isOnline } from "@/lib/utils/pwa";

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setOnline(isOnline());

    const handleOnline = async () => {
      setOnline(true);
      setIsSyncing(true);
      await flushPendingActions().catch(() => null);
      setIsSyncing(false);
      window.dispatchEvent(new Event("pocketsense-pwa-sync-complete"));
    };

    const handleOffline = () => setOnline(false);

    const handleServiceWorkerMessage = async (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === "SYNC_PENDING_ACTIONS") {
        await handleOnline();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker?.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker?.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, []);

  if (online) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 top-3 z-[60] rounded-[24px] border border-amber-200 bg-amber-50/95 px-4 py-3 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-amber-900 dark:text-amber-200">
          <CloudOff className="h-5 w-5" />
          <div>
            <p className="font-semibold">You&apos;re offline</p>
            <p className="text-sm opacity-80 dark:text-amber-200/90">New expense actions will be queued and synced when you reconnect.</p>
          </div>
        </div>
        <Button type="button" variant="outline" className="rounded-full" disabled={isSyncing}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          Waiting
        </Button>
      </div>
    </div>
  );
}
