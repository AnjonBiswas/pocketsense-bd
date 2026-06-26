import dynamic from "next/dynamic";

const NotificationSettingsClient = dynamic(
  () =>
    import("@/components/notifications/NotificationSettingsClient").then(
      (module) => module.NotificationSettingsClient
    ),
  {
    loading: () => <div className="h-80 animate-pulse rounded-[32px] bg-white/70" />
  }
);

export default function NotificationSettingsPage() {
  return <NotificationSettingsClient />;
}
