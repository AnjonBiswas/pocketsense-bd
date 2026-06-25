"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PreferenceData = {
  preferences: {
    language: "bn" | "en";
    currency: string;
    theme: ThemeMode;
    first_day_of_month: number;
  };
};

export function PreferencesSettingsClient() {
  const { setLanguage } = useLanguage();
  const { setTheme } = useTheme();
  const [data, setData] = useState<PreferenceData | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!payload?.error) {
          setData(payload);
        }
      })
      .catch(() => null);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Loading preferences...
      </div>
    );
  }

  const preferences = data.preferences;

  function save(nextPreferences = preferences) {
    startTransition(async () => {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          section: "preferences",
          ...nextPreferences
        })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.settings) {
        setMessage(payload?.error || "Could not save preferences.");
        return;
      }

      setData(payload.settings);
      setLanguage(payload.settings.preferences.language);
      setTheme(payload.settings.preferences.theme);
      setMessage("Preferences updated.");
    });
  }

  function updatePreference<K extends keyof PreferenceData["preferences"]>(key: K, value: PreferenceData["preferences"][K]) {
    const next = {
      ...preferences,
      [key]: value
    };
    setData((current) => (current ? { ...current, preferences: next } : current));
    if (key === "language") {
      setLanguage(value as "bn" | "en");
    }
    if (key === "theme") {
      setTheme(value as ThemeMode);
    }
    save(next);
  }

  return (
    <div className="space-y-5">
      <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="font-medium text-slate-900 dark:text-slate-50">Language</p>
            <div className="flex flex-wrap gap-3">
              {(["bn", "en"] as const).map((language) => (
                <Button
                  key={language}
                  type="button"
                  variant={preferences.language === language ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => updatePreference("language", language)}
                >
                  {language === "bn" ? "Bangla" : "English"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-medium text-slate-900 dark:text-slate-50">Currency</p>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              BDT is fixed for now across the whole app.
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-medium text-slate-900 dark:text-slate-50">Theme</p>
            <div className="flex flex-wrap gap-3">
              {(["light", "dark", "system"] as const).map((theme) => (
                <Button
                  key={theme}
                  type="button"
                  variant={preferences.theme === theme ? "default" : "outline"}
                  className="rounded-full capitalize"
                  onClick={() => updatePreference("theme", theme)}
                >
                  {theme}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-medium text-slate-900 dark:text-slate-50">Budget cycle start day</p>
            <select
              value={preferences.first_day_of_month}
              onChange={(event) => updatePreference("first_day_of_month", Number(event.target.value))}
              className="flex h-10 w-full max-w-xs rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background"
            >
              {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day}>
                  Day {day}
                </option>
              ))}
            </select>
          </div>

          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          {isPending ? <p className="text-sm text-muted-foreground">Saving preferences...</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
