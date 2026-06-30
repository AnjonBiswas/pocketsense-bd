import Link from "next/link";
import { Suspense } from "react";
import { PocketSenseLogo } from "@/components/brand/PocketSenseLogo";
import { ReferralLandingBanner } from "@/components/features/ReferralLandingBanner";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <Suspense fallback={null}>
          <ReferralLandingBanner />
        </Suspense>
        <div className="flex justify-center">
          <PocketSenseLogo showWordmark={false} size={88} priority />
        </div>
        <h1 className="text-4xl font-bold">PocketSense BD</h1>
        <p className="text-muted-foreground">Free student budgeting with email/password and optional Google sign-in.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/signup">Create Free Account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/blog">Read Blog</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
