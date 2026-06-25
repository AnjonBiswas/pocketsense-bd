"use client";

import { Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ChallengeCardProps = {
  challenge: {
    id: string;
    name: { bn: string; en: string };
    description: { bn: string; en: string };
    target: number;
    progress: number;
    xp: number;
    badge: string;
    status: "available" | "active" | "completed" | "failed";
  };
  onStart: (challengeId: string) => Promise<void> | void;
  onRefresh: (challengeId: string) => Promise<void> | void;
};

export function ChallengeCard({ challenge, onStart, onRefresh }: ChallengeCardProps) {
  const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{challenge.name.bn}</CardTitle>
            <CardDescription>{challenge.description.bn}</CardDescription>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
            <Trophy className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {challenge.progress}/{challenge.target} completed
            </span>
            <span className="font-medium text-slate-900">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                challenge.status === "completed" ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4 text-amber-500" />
            Reward
          </span>
          <span className="font-semibold text-slate-900">
            {challenge.xp} XP • {challenge.badge}
          </span>
        </div>

        {challenge.status === "available" ? (
          <Button type="button" className="w-full rounded-full" onClick={() => onStart(challenge.id)}>
            Start Challenge
          </Button>
        ) : null}

        {challenge.status === "active" ? (
          <Button type="button" variant="outline" className="w-full rounded-full" onClick={() => onRefresh(challenge.id)}>
            Check Progress
          </Button>
        ) : null}

        {challenge.status === "completed" ? (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Completed • Badge unlocked
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

