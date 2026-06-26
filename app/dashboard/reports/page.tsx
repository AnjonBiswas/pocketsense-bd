import { endOfMonth, format, startOfMonth } from "date-fns";
import { headers } from "next/headers";
import { ReportsDashboardClient } from "@/components/reports/ReportsDashboardClient";

function buildEmptyReportsPayload(startDate: string, endDate: string) {
  return {
    startDate,
    endDate,
    metrics: {
      totalIncome: 0,
      totalExpenses: 0,
      savings: 0,
      savingsRate: 0
    },
    categoryBreakdown: [],
    dailySpending: [],
    monthlyComparison: [],
    heatmap: [],
    insights: [],
    forecast: [],
    studentComparison: []
  };
}

async function getInitialReports() {
  const headerStore = headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || (process.env.NODE_ENV === "development" ? "http" : "https");
  const cookie = headerStore.get("cookie") || "";
  const startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const endDate = format(endOfMonth(new Date()), "yyyy-MM-dd");

  if (!host) {
    return buildEmptyReportsPayload(startDate, endDate);
  }

  try {
    const response = await fetch(`${protocol}://${host}/api/reports?startDate=${startDate}&endDate=${endDate}`, {
      cache: "no-store",
      headers: {
        cookie
      }
    });

    if (!response.ok) {
      return buildEmptyReportsPayload(startDate, endDate);
    }

    return response.json();
  } catch {
    return buildEmptyReportsPayload(startDate, endDate);
  }
}

export default async function ReportsPage() {
  const initialData = await getInitialReports();
  return <ReportsDashboardClient initialData={initialData} />;
}
