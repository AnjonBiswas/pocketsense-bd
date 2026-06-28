"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StreakDisplayProps = {
  streak: number;
  monthlyRank: string;
};

function localizeRank(monthlyRank: string, t: (key: string) => string) {
  if (monthlyRank === "Top Saver") {
    return t("dashboard.topSaver");
  }

  if (monthlyRank === "Getting Started") {
    return t("dashboard.gettingStarted");
  }

  return monthlyRank;
}

export function StreakDisplay({ streak, monthlyRank }: StreakDisplayProps) {
  const { t } = useLanguage();

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("dashboard.consistencyPower")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-4"
          style={{ color: "#7c2d12" }}
        >
          <div className="text-3xl">🔥</div>
          <div>
            <p className="text-2xl font-bold" style={{ color: "#7c2d12" }}>
              {streak} {t("dashboard.days")} {t("dashboard.streak")}
            </p>
            <p className="text-sm" style={{ color: "#9a3412" }}>
              {t("dashboard.keepGoing")}
            </p>
          </div>
        </div>
        <div className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {t("dashboard.monthlyRank")}: {localizeRank(monthlyRank, t)}
        </div>
      </CardContent>
    </Card>
  );
}
