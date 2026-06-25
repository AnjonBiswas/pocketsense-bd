"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { AvatarUpload } from "@/components/settings/AvatarUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SettingsPayload = {
  profile: {
    phone: string | null;
    name: string | null;
    university: string | null;
    avatar_url: string | null;
  };
};

const UNIVERSITIES = ["DU", "BUET", "NSU", "BRAC", "IUB", "JNU", "SUST", "RUET", "CU", "Others"];

export function ProfileSettingsClient() {
  const [data, setData] = useState<SettingsPayload | null>(null);
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.error) return;
        setData(payload);
        setName(payload.profile.name || "");
        setUniversity(payload.profile.university || "");
      })
      .catch(() => null);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Loading profile settings...
      </div>
    );
  }

  function saveProfile() {
    startTransition(async () => {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          section: "profile",
          name,
          university
        })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.settings) {
        setMessage(payload?.error || "Could not save profile.");
        return;
      }

      setData(payload.settings);
      setMessage("Profile updated successfully.");
    });
  }

  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardHeader>
        <CardTitle>Profile Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarUpload
          avatarUrl={data.profile.avatar_url}
          onUploaded={(avatar_url) =>
            setData((current) => (current ? { ...current, profile: { ...current.profile, avatar_url } } : current))
          }
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Full name</Label>
            <Input id="settings-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-university">University</Label>
            <select
              id="settings-university"
              value={university}
              onChange={(event) => setUniversity(event.target.value)}
              className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background"
            >
              <option value="">Select university</option>
              {UNIVERSITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-phone">Phone number</Label>
          <Input id="settings-phone" value={data.profile.phone || ""} readOnly />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" className="rounded-full" disabled={isPending} onClick={saveProfile}>
            {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save profile
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
