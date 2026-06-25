"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentReminder } from "@/components/squads/PaymentReminder";
import type { Settlement } from "@/lib/utils/splitCalculator";
import type { SquadMemberProfile } from "@/lib/utils/squads";

type SettlementCardProps = {
  settlement: Settlement;
  currentUserId: string | null;
  members: SquadMemberProfile[];
  onSettle: (settlement: Settlement) => Promise<void> | void;
};

function resolveMemberName(members: SquadMemberProfile[], userId: string) {
  return members.find((member) => member.id === userId)?.name || "Friend";
}

function resolveBkashNumber(members: SquadMemberProfile[], userId: string) {
  return members.find((member) => member.id === userId)?.phone || "01XXXXXXXXX";
}

export function SettlementCard({ settlement, currentUserId, members, onSettle }: SettlementCardProps) {
  const fromName = resolveMemberName(members, settlement.fromUserId);
  const toName = resolveMemberName(members, settlement.toUserId);
  const youOwe = currentUserId === settlement.fromUserId;
  const description = youOwe
    ? `You owe ${toName} ৳${settlement.amount.toFixed(0)}`
    : `${fromName} owes you ৳${settlement.amount.toFixed(0)}`;

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardContent className="space-y-4 p-5">
        <div>
          <p className="text-lg font-semibold text-slate-900">{description}</p>
          <p className="text-sm text-muted-foreground">
            {youOwe
              ? "Clear this with a payment to settle the squad fairly."
              : "Send a reminder or mark it paid once you receive the money."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" className="rounded-full" onClick={() => onSettle(settlement)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as Paid
          </Button>
          <PaymentReminder
            amount={settlement.amount}
            expenseLabel="shared squad expenses"
            bkashNumber={resolveBkashNumber(members, settlement.toUserId)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

