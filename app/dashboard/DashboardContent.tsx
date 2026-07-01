import { DashboardOverviewClient } from "@/components/dashboard/DashboardOverviewClient";
import { DashboardPreload } from "@/components/dashboard/DashboardPreload";
import { DashboardRouteWarmup } from "@/components/dashboard/DashboardRouteWarmup";
import { getDashboardExpenses } from "@/lib/dashboard/get-dashboard-expenses";
import { getDashboardStats } from "@/lib/dashboard/get-dashboard-stats";

export default async function DashboardContent() {
  const [initialStats, initialExpenses] = await Promise.all([getDashboardStats(), getDashboardExpenses()]);

  return (
    <>
      <DashboardPreload />
      <DashboardRouteWarmup />
      <DashboardOverviewClient initialStats={initialStats} initialExpenses={initialExpenses} />
    </>
  );
}
