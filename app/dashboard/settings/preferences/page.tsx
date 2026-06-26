import dynamic from "next/dynamic";

const PreferencesSettingsClient = dynamic(
  () =>
    import("@/components/settings/PreferencesSettingsClient").then((module) => module.PreferencesSettingsClient),
  {
    loading: () => <div className="h-80 animate-pulse rounded-[32px] bg-white/70" />
  }
);

export default function PreferencesSettingsPage() {
  return <PreferencesSettingsClient />;
}
