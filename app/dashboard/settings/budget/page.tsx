import dynamic from "next/dynamic";

const BudgetSettingsClient = dynamic(
  () => import("@/components/settings/BudgetSettingsClient").then((module) => module.BudgetSettingsClient),
  {
    loading: () => <div className="h-80 animate-pulse rounded-[32px] bg-white/70" />
  }
);

export default function BudgetSettingsPage() {
  return <BudgetSettingsClient />;
}
