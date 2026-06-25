"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SquadMemberProfile } from "@/lib/utils/squads";

type AddSquadExpenseModalProps = {
  squadId: string;
  members: SquadMemberProfile[];
  onAdded: () => Promise<void> | void;
};

export function AddSquadExpenseModal({ squadId, members, onAdded }: AddSquadExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState(members[0]?.id || "");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPaidBy(members[0]?.id || "");
    setCustomAmounts(
      members.reduce<Record<string, string>>((accumulator, member) => {
        accumulator[member.id] = "";
        return accumulator;
      }, {})
    );
  }, [members, open]);

  const submit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/squads/${squadId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Number(amount),
          description,
          paidBy,
          splitAmong: members.map((member) => member.id),
          splitType,
          customAmounts:
            splitType === "custom"
              ? Object.fromEntries(
                  Object.entries(customAmounts).map(([key, value]) => [key, Number(value || 0)])
                )
              : undefined,
          date
        })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to add squad expense.");
      }

      setOpen(false);
      setAmount("");
      setDescription("");
      await onAdded();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add squad expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-primary text-primary-foreground">Add squad expense</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add squad expense</DialogTitle>
          <DialogDescription>Log who paid and how this cost should be split.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Dinner at TSC" />
          </div>
          <div className="space-y-2">
            <Label>Who paid</Label>
            <div className="grid gap-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  className={`rounded-2xl border px-4 py-3 text-left ${
                    paidBy === member.id ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50"
                  }`}
                  onClick={() => setPaidBy(member.id)}
                >
                  <p className="font-medium">{member.name || member.phone}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>Split type</Label>
            <div className="flex gap-2">
              <Button type="button" variant={splitType === "equal" ? "default" : "outline"} onClick={() => setSplitType("equal")}>
                Equal split
              </Button>
              <Button type="button" variant={splitType === "custom" ? "default" : "outline"} onClick={() => setSplitType("custom")}>
                Custom split
              </Button>
            </div>
          </div>
          {splitType === "custom" ? (
            <div className="space-y-3">
              <Label>Custom amounts</Label>
              {members.map((member) => (
                <div key={member.id} className="grid grid-cols-[1fr_120px] gap-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
                    {member.name || member.phone}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={customAmounts[member.id] || ""}
                    onChange={(event) =>
                      setCustomAmounts((current) => ({
                        ...current,
                        [member.id]: event.target.value
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
