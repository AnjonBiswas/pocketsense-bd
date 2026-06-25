"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { dashboardNavItems } from "@/components/dashboard/nav-config";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function MobileSidebar({
  userName
}: {
  userName: string;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    const handleStart = (event: TouchEvent) => {
      if (event.touches[0].clientX <= 18) {
        setTouchStartX(event.touches[0].clientX);
      }
    };

    const handleMove = (event: TouchEvent) => {
      if (touchStartX === null) {
        return;
      }

      const delta = event.touches[0].clientX - touchStartX;
      if (delta > 70) {
        setOpen(true);
        setTouchStartX(null);
      }
    };

    const handleEnd = () => setTouchStartX(null);

    window.addEventListener("pocketsense-open-sidebar", handleOpen);
    window.addEventListener("touchstart", handleStart);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("pocketsense-open-sidebar", handleOpen);
      window.removeEventListener("touchstart", handleStart);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [touchStartX]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm transition-opacity xl:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[55] w-[82vw] max-w-[320px] border-r border-white/60 bg-white/95 px-5 py-5 shadow-2xl backdrop-blur transition-transform duration-300 xl:hidden dark:border-slate-700 dark:bg-slate-950/95",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">{t("common.appName")}</p>
            <p className="text-xs text-muted-foreground">{userName}</p>
          </div>
          <button type="button" className="tap-safe rounded-full p-2 hover:bg-secondary" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 space-y-2" data-tour="navigation-row">
          {dashboardNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[48px] items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                )}
                onClick={() => {
                  setOpen(false);
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
