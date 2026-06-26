"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "pocketsense-pending-referral";

export function ReferralLandingBanner() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");

    if (ref) {
      window.localStorage.setItem(STORAGE_KEY, ref);
      setCode(ref);
      return;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    setCode(saved);
  }, [searchParams]);

  if (!code) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left text-sm text-emerald-900">
      Referral applied: <span className="font-semibold">{code}</span>. Finish signup and onboarding to unlock the +500 XP welcome reward.
    </div>
  );
}
