import dynamic from "next/dynamic";

const ProfileSettingsClient = dynamic(
  () => import("@/components/settings/ProfileSettingsClient").then((module) => module.ProfileSettingsClient),
  {
    loading: () => <div className="h-80 animate-pulse rounded-[32px] bg-white/70" />
  }
);

export default function ProfileSettingsPage() {
  return <ProfileSettingsClient />;
}
