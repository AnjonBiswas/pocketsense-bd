import { DashboardCardSkeleton } from "@/components/dashboard/DashboardCardSkeleton";

export default function DashboardLoading() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton tall />
      <DashboardCardSkeleton tall />
    </div>
  );
}
