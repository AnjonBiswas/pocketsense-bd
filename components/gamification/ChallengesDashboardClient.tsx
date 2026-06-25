"use client";

import { useEffect, useState, useTransition } from "react";
import confetti from "canvas-confetti";
import { ChallengeCard } from "@/components/gamification/ChallengeCard";
import { BadgeDisplay } from "@/components/gamification/BadgeDisplay";
import { XPProgressBar } from "@/components/gamification/XPProgressBar";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenseStore } from "@/store/expenseStore";

type ChallengeItem = {
  id: string;
  name: { bn: string; en: string };
  description: { bn: string; en: string };
  target: number;
  progress: number;
  xp: number;
  badge: string;
  status: "available" | "active" | "completed" | "failed";
};

type ChallengesPayload = {
  profile: {
    xp: number;
    level: number;
    current_streak: number;
    longest_streak: number;
    badges: string[];
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    rewardXp: number;
    rewardBadge: string | null;
  };
  activeChallenges: ChallengeItem[];
  availableChallenges: ChallengeItem[];
  completedChallenges: ChallengeItem[];
};

export function ChallengesDashboardClient() {
  const [data, setData] = useState<ChallengesPayload | null>(null);
  const [isPending, startTransition] = useTransition();
  const showToast = useExpenseStore((state) => state.showToast);

  const load = () => {
    startTransition(async () => {
      const response = await fetch("/api/challenges", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) return;
      setData(payload);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const startChallenge = async (challengeId: string) => {
    const response = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId })
    });
    if (!response.ok) return;
    load();
  };

  const refreshChallenge = async (challengeId: string) => {
    const response = await fetch("/api/challenges", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) return;

    if (payload.unlockedBadge) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      showToast({
        type: "success",
        message: `🎉 Badge unlocked: ${payload.unlockedBadge}!`
      });
    }

    load();
  };

  if (isPending && !data) {
    return <div className="h-96 animate-pulse rounded-[32px] border border-white/60 bg-white/80" />;
  }

  if (!data) {
    return (
      <Card className="border-white/60 bg-white/90 shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground">Unable to load challenges.</CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Gamification</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Challenges & rewards</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Stay motivated with XP, badges, streaks, and campus-friendly money missions.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <XPProgressBar xp={data.profile.xp} level={data.profile.level} />
        <StreakCounter
          currentStreak={data.streak.currentStreak}
          longestStreak={data.streak.longestStreak}
          rewardXp={data.streak.rewardXp}
          rewardBadge={data.streak.rewardBadge}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Active challenges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.activeChallenges.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 px-4 py-6 text-sm text-muted-foreground">
                No active challenges yet. Start one below.
              </div>
            ) : null}
            {data.activeChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} onStart={startChallenge} onRefresh={refreshChallenge} />
            ))}
          </CardContent>
        </Card>

        <BadgeDisplay earnedBadges={data.profile.badges} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Available challenges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.availableChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} onStart={startChallenge} onRefresh={refreshChallenge} />
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Completed challenges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.completedChallenges.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 px-4 py-6 text-sm text-muted-foreground">
                Finish a challenge to earn your first badge.
              </div>
            ) : null}
            {data.completedChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} onStart={startChallenge} onRefresh={refreshChallenge} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Leaderboard />
    </section>
  );
}

