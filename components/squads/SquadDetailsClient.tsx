"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Papa from "papaparse";
import { format } from "date-fns";
import { Download, ReceiptText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AddSquadExpenseModal } from "@/components/squads/AddSquadExpenseModal";
import { SettlementCard } from "@/components/squads/SettlementCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Settlement } from "@/lib/utils/splitCalculator";
import type { SquadDetailsPayload, SquadExpenseRecord } from "@/lib/utils/squads";

export function SquadDetailsClient({ squadId }: { squadId: string }) {
  const [data, setData] = useState<SquadDetailsPayload | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadDetails = useCallback(() => {
    startTransition(async () => {
      const response = await fetch(`/api/squads/${squadId}/expenses`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) return;
      setData(payload);
    });
  }, [squadId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`squad-${squadId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "squad_expenses", filter: `squad_id=eq.${squadId}` },
        loadDetails
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "squad_settlements", filter: `squad_id=eq.${squadId}` },
        loadDetails
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadDetails, squadId]);

  const exportExpenses = () => {
    if (!data) return;

    const csv = Papa.unparse(
      data.expenses.map((expense) => ({
        Date: expense.date,
        Description: expense.description,
        Amount: expense.amount,
        PaidBy: data.members.find((member) => member.id === expense.paid_by)?.name || expense.paid_by,
        SplitType: expense.split_type
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.squad.name}-expenses.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const settleUp = async (settlement: Settlement) => {
    const response = await fetch(`/api/squads/${squadId}/settlements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fromUserId: settlement.fromUserId,
        toUserId: settlement.toUserId,
        amount: settlement.amount
      })
    });

    if (!response.ok) return;
    loadDetails();
  };

  const totalSpent = useMemo(
    () => data?.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0,
    [data]
  );

  if (isPending && !data) {
    return <div className="h-80 animate-pulse rounded-[32px] border border-white/60 bg-white/80" />;
  }

  if (!data) {
    return (
      <Card className="border-white/60 bg-white/90 shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground">Unable to load squad details.</CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Squad details</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{data.squad.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.members.length} members • ৳{totalSpent.toFixed(0)} tracked
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddSquadExpenseModal squadId={squadId} members={data.members} onAdded={loadDetails} />
          <Button type="button" variant="outline" className="rounded-full" onClick={exportExpenses}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex -space-x-3">
        {data.members.map((member) => (
          <div key={member.id} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-emerald-100 to-amber-100 text-sm font-semibold text-slate-900">
            {(member.name || member.phone || "?").slice(0, 1).toUpperCase()}
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/60 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Expense list</CardTitle>
            <CardDescription>Every shared bill inside this squad.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.expenses.map((expense: SquadExpenseRecord) => (
              <div key={expense.id} className="rounded-3xl bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Paid by {data.members.find((member) => member.id === expense.paid_by)?.name || expense.paid_by} •{" "}
                      {format(new Date(expense.date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">৳{expense.amount.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">{expense.split_type} split</p>
                  </div>
                </div>
              </div>
            ))}
            {data.expenses.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 px-4 py-8 text-center text-sm text-muted-foreground">
                No squad expenses yet.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-white/60 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>Settlement summary</CardTitle>
              <CardDescription>Who owes whom right now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.settlements.length === 0 ? (
                <div className="rounded-3xl bg-emerald-50 px-4 py-6 text-sm text-emerald-800">Everyone is settled up.</div>
              ) : null}
              {data.settlements.map((settlement, index) => (
                <SettlementCard
                  key={`${settlement.fromUserId}-${settlement.toUserId}-${index}`}
                  settlement={settlement}
                  currentUserId={data.currentUserId}
                  members={data.members}
                  onSettle={settleUp}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/60 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>Settlement history</CardTitle>
              <CardDescription>Recent mark-as-paid activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.settlementHistory.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 px-4 py-6 text-sm text-muted-foreground">
                  No settlement history yet.
                </div>
              ) : null}
              {data.settlementHistory.map((item) => (
                <div key={item.id} className="rounded-3xl bg-slate-50 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <ReceiptText className="mt-1 h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {(data.members.find((member) => member.id === item.from_user_id)?.name || "A member")} paid{" "}
                        {(data.members.find((member) => member.id === item.to_user_id)?.name || "a member")} ৳
                        {item.amount.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.note || "Settlement recorded"} • {format(new Date(item.created_at), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
