"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SquadCardSummary } from "@/lib/utils/squads";

const CreateSquadModal = dynamic(
  () => import("@/components/squads/CreateSquadModal").then((module) => module.CreateSquadModal),
  {
    ssr: false,
    loading: () => <div className="h-12 w-36 animate-pulse rounded-full bg-white/70 dark:bg-slate-800" />
  }
);

export function SquadsPageClient() {
  const [squads, setSquads] = useState<SquadCardSummary[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadSquads = () => {
    startTransition(async () => {
      const response = await fetch("/api/squads", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) return;
      setSquads(payload.squads || []);
      setCurrentUserId(payload.currentUserId || null);
    });
  };

  useEffect(() => {
    loadSquads();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("squads-overview")
      .on("postgres_changes", { event: "*", schema: "public", table: "squads" }, loadSquads)
      .on("postgres_changes", { event: "*", schema: "public", table: "squad_expenses" }, loadSquads)
      .on("postgres_changes", { event: "*", schema: "public", table: "squad_settlements" }, loadSquads)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Squads</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Group expense splitting</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Shared meals, rides, and hangouts with clear settlements.
          </p>
        </div>
        <CreateSquadModal onCreated={loadSquads} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {isPending && squads.length === 0
          ? Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-52 animate-pulse rounded-[32px] border border-white/60 bg-white/80" />
            ))
          : null}

        {!isPending && squads.length === 0 ? (
          <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur xl:col-span-2">
            <CardContent className="px-6 py-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-primary">
                <Users className="h-9 w-9" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">No squads yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">Create your first squad to split food, rides, and trips.</p>
            </CardContent>
          </Card>
        ) : null}

        {squads.map((entry) => (
          <Link key={entry.squad.id} href={`/dashboard/squads/${entry.squad.id}`}>
            <Card className="h-full border-white/60 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">{entry.squad.name}</CardTitle>
                <CardDescription>
                  Last activity{" "}
                  {entry.lastActivity
                    ? formatDistanceToNow(new Date(entry.lastActivity), { addSuffix: true })
                    : "just now"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex -space-x-3">
                  {entry.members.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-emerald-100 to-amber-100 text-sm font-semibold text-slate-900"
                    >
                      {(member.name || member.phone || "?").slice(0, 1).toUpperCase()}
                    </div>
                  ))}
                </div>
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-sm text-muted-foreground">Pending settlements</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{entry.pendingSettlements.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.pendingSettlements[0]
                      ? entry.pendingSettlements[0].fromUserId === currentUserId
                        ? "You still owe someone in this squad."
                        : "Someone still owes you here."
                      : "Everything looks settled."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
