"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="max-w-md rounded-[32px] border border-white/60 bg-white/90 p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold">ড্যাশবোর্ড লোড করা যায়নি</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          একটু পরে আবার চেষ্টা করুন। প্রয়োজনে পেজ রিফ্রেশও করতে পারেন।
        </p>
        <Button className="mt-6" onClick={reset}>
          আবার চেষ্টা করো
        </Button>
      </div>
    </div>
  );
}
