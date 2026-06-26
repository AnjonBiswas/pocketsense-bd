import dynamic from "next/dynamic";

const AccountSettingsClient = dynamic(
  () => import("@/components/settings/AccountSettingsClient").then((module) => module.AccountSettingsClient),
  {
    loading: () => <div className="h-80 animate-pulse rounded-[32px] bg-white/70" />
  }
);

export default function AccountSettingsPage() {
  return <AccountSettingsClient />;
}
