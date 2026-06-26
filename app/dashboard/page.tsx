import { DashboardOverviewClient } from "@/components/dashboard/DashboardOverviewClient";
import { DashboardPreload } from "@/components/dashboard/DashboardPreload";
import { getDashboardExpenses } from "@/lib/dashboard/get-dashboard-expenses";
import { getDashboardStats } from "@/lib/dashboard/get-dashboard-stats";

export default async function DashboardPage() {
  const [initialStats, initialExpenses] = await Promise.all([getDashboardStats(), getDashboardExpenses()]);

  return (
    <>
      <DashboardPreload />
      <DashboardOverviewClient initialStats={initialStats} initialExpenses={initialExpenses} />
    </>
  );
}
