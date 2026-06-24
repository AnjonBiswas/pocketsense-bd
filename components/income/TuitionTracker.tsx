"use client";

import { format } from "date-fns";
import { BellRing, CheckCircle2, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TuitionStudentSummary } from "@/lib/utils/income";

type TuitionTrackerProps = {
  students: TuitionStudentSummary[];
  onMarkPaid: (student: TuitionStudentSummary) => void;
};

export function TuitionTracker({ students, onMarkPaid }: TuitionTrackerProps) {
  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Tuition tracker</CardTitle>
        <CardDescription>কার কাছ থেকে টিউশন ফি পাওয়ার কথা, আর কে এই মাসে পেমেন্ট করেছে।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {students.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 px-4 py-6 text-sm text-muted-foreground">
            এখনও কোনো টিউশন ইনকাম পাওয়া যায়নি। একটি tuition income যোগ করলে ট্র্যাকার এখানে দেখাবে।
          </div>
        ) : null}

        {students.map((student) => {
          const paid = student.paidThisMonth;

          return (
            <div
              key={student.name}
              className={`rounded-3xl border px-4 py-4 ${
                paid ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/80"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {paid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <CircleAlert className="h-4 w-4 text-amber-600" />
                    )}
                    <p className="font-semibold">{student.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Amount per month: ৳{student.amountPerMonth}</p>
                  <p className="text-sm text-muted-foreground">
                    Last payment:{" "}
                    {student.lastPaymentDate ? format(new Date(student.lastPaymentDate), "dd MMM yyyy") : "Never"}
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <BellRing className="h-4 w-4 text-sky-600" />
                    {student.reminderText}
                  </p>
                </div>

                <Button
                  type="button"
                  variant={paid ? "outline" : "default"}
                  className={paid ? "rounded-full" : "rounded-full bg-emerald-600 text-white hover:bg-emerald-700"}
                  onClick={() => onMarkPaid(student)}
                >
                  Mark Paid
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

