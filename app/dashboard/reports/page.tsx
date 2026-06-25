import { endOfMonth, format, startOfMonth } from "date-fns";
import { headers } from "next/headers";
import { ReportsDashboardClient } from "@/components/reports/ReportsDashboardClient";

async function getInitialReports() {
  const headerStore = headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || (process.env.NODE_ENV === "development" ? "http" : "https");
  const cookie = headerStore.get("cookie") || "";
  const startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const endDate = format(endOfMonth(new Date()), "yyyy-MM-dd");

  if (!host) {
    throw new Error("Unable to resolve reports host.");
  }

  const response = await fetch(`${protocol}://${host}/api/reports?startDate=${startDate}&endDate=${endDate}`, {
    cache: "no-store",
    headers: {
      cookie
    }
  });

  if (!response.ok) {
    throw new Error("Failed to load reports.");
  }

  return response.json();
}

export default async function ReportsPage() {
  const initialData = await getInitialReports();
  return <ReportsDashboardClient initialData={initialData} />;
}
