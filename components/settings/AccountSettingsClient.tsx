"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountSettingsClient() {
  const router = useRouter();
  const supabase = createClient();
  const [phone, setPhone] = useState("+880");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  async function requestPhoneChange() {
    setIsSending(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ phone });
      if (error) {
        throw error;
      }
      setIsOtpSent(true);
      setMessage("OTP sent to your new phone number.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send OTP.");
    } finally {
      setIsSending(false);
    }
  }

  async function verifyPhoneChange() {
    setIsSending(true);
    setMessage("");

    try {
      const payload: Parameters<typeof supabase.auth.verifyOtp>[0] = {
        phone,
        token: otp,
        type: "phone_change"
      };
      const { error } = await supabase.auth.verifyOtp(payload);
      if (error) {
        throw error;
      }
      setMessage("Phone number updated successfully.");
      setIsOtpSent(false);
      setOtp("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not verify OTP.");
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
            <p className="font-semibold text-slate-900 dark:text-slate-50">Change phone number</p>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="new-phone">New phone</Label>
                <Input id="new-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </div>
              <Button type="button" className="self-end rounded-full" disabled={isSending} onClick={requestPhoneChange}>
                {isSending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send OTP
              </Button>
            </div>

            {isOtpSent ? (
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="phone-otp">Verify OTP</Label>
                  <Input id="phone-otp" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Enter OTP" />
                </div>
                <Button type="button" variant="outline" className="self-end rounded-full" disabled={isSending} onClick={verifyPhoneChange}>
                  Verify
                </Button>
              </div>
            ) : null}
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
