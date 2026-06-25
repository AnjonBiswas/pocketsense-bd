"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { registerServiceWorker } from "@/lib/utils/pwa";

export function PWAClientShell() {
  const router = useRouter();

  useEffect(() => {
    registerServiceWorker().catch(() => null);

    const handleSyncComplete = () => {
      router.refresh();
    };

    window.addEventListener("pocketsense-pwa-sync-complete", handleSyncComplete);
    return () => window.removeEventListener("pocketsense-pwa-sync-complete", handleSyncComplete);
  }, [router]);

  return (
    <>
      <OfflineIndicator />
      <InstallPrompt />
    </>
  );
}
