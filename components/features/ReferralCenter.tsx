"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Gift, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReferralCenter({ code }: { code: string }) {
  const [origin, setOrigin] = useState("https://pocketsense.local");
  const [stats, setStats] = useState({
    signups: 0,
    pending: 0,
    rewardXp: 0
  });

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/referrals", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.stats) {
          setStats(payload.stats);
        }
      })
      .catch(() => null);
  }, [code]);

  const link = useMemo(() => `${origin}/?ref=${code}`, [code, origin]);

  async function copyLink() {
    await navigator.clipboard.writeText(link).catch(() => null);
  }

  async function shareLink() {
    if ("share" in navigator) {
      await navigator
        .share({
          title: "PocketSense",
          text: "Join PocketSense and we both get +500 XP.",
          url: link
        })
        .catch(() => null);
      return;
    }

    await copyLink();
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/60 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Friend referral rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[28px] bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 p-5 text-white">
              <p className="text-sm font-medium opacity-85">Your referral code</p>
              <p className="mt-3 text-3xl font-bold tracking-[0.18em]">{code}</p>
              <p className="mt-2 text-sm opacity-80">Both you and your friend get +500 XP when they finish onboarding.</p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Referral link</p>
              <p className="mt-2 break-all text-sm text-slate-900">{link}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" className="rounded-full" onClick={copyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={shareLink}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card className="border-white/60 bg-white/90 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed signups</p>
                  <p className="text-2xl font-semibold text-slate-900">{stats.signups}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/60 bg-white/90 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Reward earned</p>
                  <p className="text-2xl font-semibold text-slate-900">+{stats.rewardXp} XP</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/60 bg-white/90 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Pending invites</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
