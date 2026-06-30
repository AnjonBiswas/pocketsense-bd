import { DashboardCardSkeleton } from "@/components/dashboard/DashboardCardSkeleton";

export function DashboardPageSkeleton() {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton tall />
        <DashboardCardSkeleton tall />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardCardSkeleton tall />
        <DashboardCardSkeleton tall />
      </div>
    </section>
  );
}

