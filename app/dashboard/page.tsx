import { Suspense } from "react";
import { DashboardPageSkeleton } from "@/components/dashboard/DashboardPageSkeleton";
import DashboardContent from "./DashboardContent";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

