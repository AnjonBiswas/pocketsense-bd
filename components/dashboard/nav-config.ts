import { BarChart3, CircleDollarSign, Home, Shield, Users, WalletCards } from "lucide-react";

export const dashboardNavItems = [
  { href: "/dashboard", labelKey: "nav.home", icon: Home },
  { href: "/dashboard/expenses", labelKey: "nav.expenses", icon: WalletCards },
  { href: "/dashboard/income", labelKey: "nav.income", icon: CircleDollarSign },
  { href: "/dashboard/challenges", labelKey: "nav.challenges", icon: Shield },
  { href: "/dashboard/squads", labelKey: "nav.squads", icon: Users },
  { href: "/dashboard/reports", labelKey: "nav.reports", icon: BarChart3 }
] as const;
