import { BarChart3, CircleDollarSign, Home, WalletCards } from "lucide-react";

export const dashboardNavItems = [
  { href: "/dashboard", labelKey: "nav.home", icon: Home },
  { href: "/dashboard/expenses", labelKey: "nav.expenses", icon: WalletCards },
  { href: "/dashboard/income", labelKey: "nav.income", icon: CircleDollarSign },
  { href: "/dashboard/reports", labelKey: "nav.reports", icon: BarChart3 }
] as const;
