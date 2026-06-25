"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StreakCounterProps = {
  currentStreak: number;
  longestStreak: number;
  rewardXp: number;
  rewardBadge: string | null;
};

export function StreakCounter({ currentStreak, longestStreak, rewardXp, rewardBadge }: StreakCounterProps) {
  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Budget streak</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-4">
          <div className="text-3xl">🔥</div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{currentStreak} days</p>
            <p className="text-sm text-amber-900/70">Staying under daily budget</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-muted-foreground">Longest streak</p>
            <p className="text-xl font-semibold text-slate-900">{longestStreak} days</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-muted-foreground">Reward unlocked</p>
            <p className="text-xl font-semibold text-slate-900">
              {rewardXp > 0 ? `+${rewardXp} XP` : "Keep going"}
            </p>
            <p className="text-xs text-muted-foreground">{rewardBadge || "7 days = +200 XP, 30 days = special badge"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

