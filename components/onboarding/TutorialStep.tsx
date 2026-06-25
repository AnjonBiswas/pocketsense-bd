"use client";

import { Joyride, STATUS, type EventData, type Step } from "react-joyride";
import { Flame, PlusCircle, WalletCards } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type TutorialStepProps = {
  onPrevious: () => void;
  onFinish: () => void;
};

const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="daily-budget-card"]',
    content: "এখানে আপনার safe daily spending limit দেখা যাবে।"
  },
  {
    target: '[data-tour="add-expense-button"]',
    content: "দ্রুত খরচ যোগ করার সবচেয়ে সহজ জায়গা এটা।"
  },
  {
    target: '[data-tour="streak-card"]',
    content: "প্রতিদিন budget follow করলে streak আর rewards বাড়বে।"
  },
  {
    target: '[data-tour="navigation-row"]',
    content: "এখান থেকে dashboard, expenses, income আর reports-এ যেতে পারবেন।"
  }
];

export function TutorialStep({ onPrevious, onFinish }: TutorialStepProps) {
  const [run, setRun] = useState(true);

  function handleJoyride(data: EventData) {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setRun(false);
    }
  }

  return (
    <div className="space-y-6">
      <Joyride
        steps={TOUR_STEPS}
        run={run}
        continuous
        onEvent={handleJoyride}
        options={{
          buttons: ["back", "close", "primary", "skip"],
          primaryColor: "#0f766e",
          zIndex: 90,
          skipScroll: true
        }}
        styles={{
          tooltip: {
            borderRadius: 20
          }
        }}
      />

      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Quick tutorial</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          এই short walkthrough শেষ করলে আপনি dashboard-এ confidently navigate করতে পারবেন।
        </p>
      </div>

      <div className="rounded-[36px] border border-white/60 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950/90">
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div data-tour="daily-budget-card" className="rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-700 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-white/75">Daily budget</p>
                <h3 className="mt-2 text-3xl font-bold">৳ 420</h3>
              </div>
              <WalletCards className="h-8 w-8" />
            </div>
            <p className="mt-3 text-sm text-white/80">আজ safe spending limit এই amount-এর আশেপাশে রাখুন।</p>
          </div>

          <div className="space-y-4">
            <div data-tour="add-expense-button" className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-5 text-amber-950">
              <div className="flex items-center gap-3">
                <PlusCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Add Expense</p>
                  <p className="text-sm text-amber-900/80">Tea, snacks, transport in one tap.</p>
                </div>
              </div>
            </div>
            <div data-tour="streak-card" className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-5 text-rose-950">
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6" />
                <div>
                  <p className="font-semibold">5 day streak</p>
                  <p className="text-sm text-rose-900/80">Stay under budget to build rewards.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-tour="navigation-row" className="mt-5 grid grid-cols-4 gap-3">
          {["Home", "Expenses", "Income", "Reports"].map((label) => (
            <div
              key={label}
              className="rounded-[24px] border border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" className="rounded-full" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={() => setRun(false)}>
          Skip tutorial
        </Button>
        <Button type="button" className="rounded-full" onClick={onFinish}>
          Finish
        </Button>
      </div>
    </div>
  );
}
