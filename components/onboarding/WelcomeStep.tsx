"use client";

import { ArrowRight, Coins, Sparkles, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          PocketSense BD
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-slate-50">
            আপনার টাকা সামলান সহজে
          </h2>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            ছাত্রজীবনের allowance, tuition, daily খরচ আর savings goal এক জায়গায় গুছিয়ে রাখুন। আমরা
            আপনার জন্য safe daily budget হিসাব করে দেব।
          </p>
        </div>
        <Button type="button" className="rounded-full px-6" onClick={onNext}>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-[36px] border border-white/60 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.35),transparent_35%),linear-gradient(160deg,#0f766e_0%,#155e75_42%,#1d4ed8_100%)] p-6 text-white shadow-2xl shadow-teal-950/20">
        <div className="absolute -right-12 top-6 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-center justify-between rounded-[28px] bg-white/10 px-4 py-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/70">Daily budget</p>
              <p className="mt-1 text-3xl font-bold">৳ 420</p>
            </div>
            <WalletCards className="h-9 w-9 text-amber-200" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-sm text-white/75">Monthly income</p>
              <p className="mt-2 text-2xl font-semibold">৳ 15,000</p>
            </div>
            <div className="rounded-[28px] bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-sm text-white/75">Savings goal</p>
              <p className="mt-2 text-2xl font-semibold">৳ 3,000</p>
            </div>
          </div>
          <div className="rounded-[28px] bg-white/10 px-4 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-amber-200" />
              <p className="font-medium">PocketSense keeps your campus cash flow simple and visible.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
