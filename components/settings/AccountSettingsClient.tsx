"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { updateEmail, updatePassword } from "@/lib/auth/actions";
import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountSettingsClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nextEmail, setNextEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        const currentEmail = payload?.profile?.email || "";
        setEmail(currentEmail);
        setNextEmail(currentEmail);
      })
      .catch(() => null);
  }, []);

  async function saveEmail() {
    setIsSending(true);
    setMessage("");

    try {
      const result = await updateEmail(nextEmail);
      if (!result.success) {
        throw new Error(result.error || "Could not update email.");
      }

      setMessage("Email update requested. Check both old and new inboxes if Supabase email confirmation is enabled.");
      setEmail(nextEmail);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update email.");
    } finally {
      setIsSending(false);
    }
  }

  async function savePassword() {
    setIsSending(true);
    setMessage("");

    try {
      if (password.length < 6) {
        throw new Error("Password should be at least 6 characters.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const result = await updatePassword(password);

      if (!result.success) {
        throw new Error(result.error || "Could not update password.");
      }

      setPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update password.");
    } finally {
      setIsSending(false);
    }
  }

  async function deleteAccount() {
    const response = await fetch("/api/settings", {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Could not delete account.");
    }

    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
        <CardHeader>
          <CardTitle>Account Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-[28px] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/70">
            <p className="font-semibold text-slate-900 dark:text-slate-50">Account email</p>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="account-email">Email</Label>
                <Input id="account-email" type="email" value={nextEmail} onChange={(event) => setNextEmail(event.target.value)} />
              </div>
              <Button type="button" className="self-end rounded-full" disabled={isSending} onClick={saveEmail}>
                {isSending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update email
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Current login email: {email || "Not available"}</p>
          </div>

          <div className="space-y-3 rounded-[28px] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/70">
            <p className="font-semibold text-slate-900 dark:text-slate-50">Change password</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              </div>
            </div>
            <Button type="button" variant="outline" className="rounded-full" disabled={isSending} onClick={savePassword}>
              Update password
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Button type="button" variant="outline" className="rounded-full" asChild>
              <a href="/api/export">Export all data (JSON)</a>
            </Button>
            <Button type="button" variant="outline" className="rounded-full border-red-300 text-red-700 hover:bg-red-50" onClick={() => setIsDeleteOpen(true)}>
              Delete account
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <a href="/privacy-policy" className="rounded-[24px] border border-white/60 bg-white px-4 py-4 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              Privacy policy
            </a>
            <a href="/terms-of-service" className="rounded-[24px] border border-white/60 bg-white px-4 py-4 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              Terms of service
            </a>
          </div>

          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      <DeleteAccountModal open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={deleteAccount} />
    </div>
  );
}
