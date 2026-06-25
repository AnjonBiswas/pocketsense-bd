"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SOSAutoMessageProps = {
  friendName: string;
  onFriendNameChange: (value: string) => void;
  remainingBudget: number;
  daysRemaining: number;
};

export function SOSAutoMessage({
  friendName,
  onFriendNameChange,
  remainingBudget,
  daysRemaining
}: SOSAutoMessageProps) {
  const message = `Bro, I'm broke this week. Only ৳${remainingBudget} left for ${daysRemaining} days. Raincheck on hangouts? 🙏`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${friendName ? `${friendName}, ` : ""}${message}`
  )}`;

  return (
    <div className="rounded-[28px] border border-orange-200 bg-orange-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">Quick escape message</p>
          <p className="mt-1 text-sm text-orange-900/70">{message}</p>
        </div>
        <MessageCircle className="mt-1 h-5 w-5 text-orange-600" />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          value={friendName}
          onChange={(event) => onFriendNameChange(event.target.value)}
          placeholder="Friend name (optional)"
        />
        <Button type="button" className="rounded-full bg-orange-600 hover:bg-orange-700" asChild>
          <a href={shareUrl} target="_blank" rel="noreferrer">
            Share on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
