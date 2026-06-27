"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, LogOut, Menu, Moon, Settings, Sun, User2 } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type NavbarProps = {
  userName: string;
  userPhone: string;
  avatarUrl?: string | null;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "PS";
}

export function Navbar({ userName, userPhone, avatarUrl }: NavbarProps) {
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();

  async function handleLogout() {
    const result = await signOut();

    if (result.success) {
      router.push("/auth/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/85 backdrop-blur dark:border-slate-700 dark:bg-slate-950/85">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20">
            ৳
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">{t("common.appName")}</p>
            <p className="text-xs text-muted-foreground">{t("dashboard.today")}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="tap-safe rounded-full xl:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={() => window.dispatchEvent(new Event("pocketsense-open-sidebar"))}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <NotificationCenter compact />

          <Button
            type="button"
            variant="ghost"
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="tap-safe h-11 rounded-full border border-white/60 bg-white px-3 text-slate-900 shadow-sm hover:bg-secondary/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">Dark</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="tap-safe rounded-full dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={toggleLanguage}
          >
            <Globe className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{language === "bn" ? t("common.english") : t("common.bangla")}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-full border border-white/60 bg-white px-2 py-1 pr-3 shadow-sm transition hover:bg-secondary/60 tap-safe dark:border-slate-700 dark:bg-slate-900">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={userName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                    {getInitials(userName)}
                  </div>
                )}
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userPhone}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold">{userName}</p>
                <p className="text-xs font-normal text-muted-foreground">{userPhone}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User2 className="h-4 w-4" />
                {t("common.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                  {t("common.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                {t("common.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
