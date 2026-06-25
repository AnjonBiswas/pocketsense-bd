"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { requestPushPermission } from "@/lib/notifications/pushService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type NotificationPreferences = {
  daily_budget: boolean;
  overspending: boolean;
  bill_due: boolean;
  tuition: boolean;
  friend_owed: boolean;
  challenge_completion: boolean;
  streak_milestone: boolean;
  month_end_summary: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  frequency: "immediate" | "daily" | "weekly";
};

const notificationOptions: Array<{
  key: keyof NotificationPreferences;
  title: string;
  description: string;
}> = [
  { key: "daily_budget", title: "Daily budget reminder", description: "9 AM budget nudges for each day." },
  { key: "overspending", title: "Overspending alert", description: "Instant alerts when spending pace gets risky." },
  { key: "bill_due", title: "Bill reminders", description: "Warn one day before payments are due." },
  { key: "tuition", title: "Tuition reminders", description: "Remind you about incoming tuition payments." },
  { key: "friend_owed", title: "Friend owes money", description: "Ping you when money is still pending." },
  { key: "challenge_completion", title: "Challenge completion", description: "Celebrate completed goals and badges." },
  { key: "streak_milestone", title: "Streak milestone", description: "Track under-budget streak rewards." },
  { key: "month_end_summary", title: "Month-end summary", description: "Send a monthly money wrap-up." },
  { key: "push_enabled", title: "Push notifications", description: "Browser notifications on this device." },
  { key: "email_enabled", title: "Email summary", description: "Receive reports by email." },
  { key: "sms_enabled", title: "Critical SMS", description: "SMS only for urgent alerts." }
];

export function NotificationSettingsClient() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/notifications/preferences", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!payload?.error) {
          setPreferences(payload);
        }
      })
      .catch(() => null);
  }, []);

  async function save(nextPreferences: NotificationPreferences) {
    startTransition(async () => {
      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nextPreferences)
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.preference) {
        setMessage("Could not update notification settings.");
        return;
      }

      setPreferences(payload.preference);
      setMessage("Notification settings saved.");
    });
  }

  if (!preferences) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Loading notification settings...
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Notification Preferences</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tune how PocketSense nudges you across app, push, email, and SMS.
        </p>
      </div>

      <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Alerts & reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notificationOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between gap-4 rounded-[24px] border border-slate-100 bg-slate-50/80 px-4 py-4">
              <div>
                <p className="font-medium text-slate-900">{option.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
              </div>
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  preferences[option.key]
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-slate-600 shadow-sm"
                }`}
                onClick={async () => {
                  const nextPreferences = {
                    ...preferences,
                    [option.key]: !preferences[option.key]
                  };
                  setPreferences(nextPreferences);

                  if (option.key === "push_enabled" && !preferences.push_enabled) {
                    await requestPushPermission().catch(() => null);
                  }

                  save(nextPreferences);
                }}
              >
                {preferences[option.key] ? "On" : "Off"}
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Delivery timing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {(["immediate", "daily", "weekly"] as const).map((frequency) => (
              <Button
                key={frequency}
                type="button"
                variant={preferences.frequency === frequency ? "default" : "outline"}
                className="rounded-full"
                onClick={() => {
                  const nextPreferences = { ...preferences, frequency };
                  setPreferences(nextPreferences);
                  save(nextPreferences);
                }}
              >
                {frequency === "immediate"
                  ? "Immediate"
                  : frequency === "daily"
                    ? "Daily digest"
                    : "Weekly summary"}
              </Button>
            ))}
          </div>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          {isPending ? (
            <p className="text-sm text-muted-foreground">Saving your preferences...</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
