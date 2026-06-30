import { Suspense } from "react";
import { LandingDashboard } from "@/components/landing/LandingDashboard";
import { ReferralLandingBanner } from "@/components/features/ReferralLandingBanner";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f7fff9_48%,#fffdf7_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_55%,#171717_100%)]">
      <div className="px-4 pt-4 sm:px-6">
        <Suspense fallback={null}>
          <ReferralLandingBanner />
        </Suspense>
      </div>
      <LandingDashboard />
    </main>
  );
}
