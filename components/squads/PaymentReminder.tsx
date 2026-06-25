"use client";

import { MessageCircleMore, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentReminderProps = {
  amount: number;
  expenseLabel: string;
  bkashNumber: string;
};

export function PaymentReminder({ amount, expenseLabel, bkashNumber }: PaymentReminderProps) {
  const message = `Hey! You owe ৳${amount.toFixed(0)} for ${expenseLabel}. bKash: ${bkashNumber}`;

  const shareReminder = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      await navigator.share({
        title: "Payment reminder",
        text: message
      });
      return;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Button type="button" variant="outline" className="rounded-full" onClick={shareReminder}>
      {typeof navigator !== "undefined" && "share" in navigator ? (
        <Share2 className="mr-2 h-4 w-4" />
      ) : (
        <MessageCircleMore className="mr-2 h-4 w-4" />
      )}
      Send reminder
    </Button>
  );
}

