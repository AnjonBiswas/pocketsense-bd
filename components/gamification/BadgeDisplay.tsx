"use client";

import { Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BADGE_META: Record<string, { label: string; unlockText: string }> = {
  "canteen-master": { label: "Canteen Master", unlockText: "Finish the Canteen Fast challenge" },
  "green-commuter": { label: "Green Commuter", unlockText: "Complete Walking Warrior" },
  "smoke-free": { label: "Smoke Free", unlockText: "Finish Cigarette Crusher" },
  "budget-king": { label: "Budget King", unlockText: "Stay under budget for 7 days" },
  "smart-sipper": { label: "Treat Smart", unlockText: "Choose cheaper treats 3 times" },
  "streak-legend": { label: "Streak Legend", unlockText: "Maintain a 30-day streak" }
};

export function BadgeDisplay({ earnedBadges }: { earnedBadges: string[] }) {
  const allBadges = Object.entries(BADGE_META);

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Badge collection</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {allBadges.map(([key, meta]) => {
          const unlocked = earnedBadges.includes(key);
          return (
            <div
              key={key}
              title={unlocked ? meta.label : meta.unlockText}
              className={`rounded-3xl border px-4 py-4 transition ${
                unlocked
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-slate-200 bg-slate-50 text-slate-400 grayscale"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
                  <Medal className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{meta.label}</p>
                  <p className="text-xs">{unlocked ? "Unlocked" : meta.unlockText}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

