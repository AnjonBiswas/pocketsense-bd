"use client";

import { useEffect, useState, useTransition } from "react";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeaderboardEntry = {
  id: string;
  name: string;
  university: string;
  xp: number;
  level: number;
  savings: number;
  rank: number;
};

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [friendOnly, setFriendOnly] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const response = await fetch(`/api/leaderboard?friendOnly=${friendOnly}`, {
        cache: "no-store"
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        return;
      }

      setEntries(payload.leaderboard || []);
      setUserRank(payload.userRank || null);
    });
  }, [friendOnly]);

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Leaderboard</CardTitle>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setFriendOnly((current) => !current)}
        >
          {friendOnly ? "Show all users" : "Friends only"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                {entry.rank <= 3 ? (
                  <Crown className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-semibold">{entry.rank}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{entry.name}</p>
                <p className="text-xs text-muted-foreground">{entry.university}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">{entry.xp} XP</p>
              <p className="text-xs text-muted-foreground">Level {entry.level}</p>
            </div>
          </div>
        ))}
        <div className="rounded-2xl bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
          Your rank: {userRank ?? "Unranked"} {isPending ? "| updating..." : ""}
        </div>
      </CardContent>
    </Card>
  );
}
