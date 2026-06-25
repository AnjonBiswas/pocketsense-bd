"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function XPProgressBar({ xp, level }: { xp: number; level: number }) {
  const currentLevelFloor = level * 1000;
  const nextLevelFloor = (level + 1) * 1000;
  const progress = ((xp - currentLevelFloor) / Math.max(nextLevelFloor - currentLevelFloor, 1)) * 100;

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>XP & Level</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current XP</p>
            <p className="text-3xl font-semibold text-slate-900">{xp}</p>
          </div>
          <div className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Level {level}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentLevelFloor} XP</span>
            <span>{nextLevelFloor} XP</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500" style={{ width: `${Math.max(progress, 0)}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

