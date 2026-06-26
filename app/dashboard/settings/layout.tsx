import Link from "next/link";

const settingItems = [
  { href: "/dashboard/settings", label: "Overview" },
  { href: "/dashboard/settings/profile", label: "Profile" },
  { href: "/dashboard/settings/preferences", label: "Preferences" },
  { href: "/dashboard/settings/notifications", label: "Notifications" },
  { href: "/dashboard/settings/budget", label: "Budget" },
  { href: "/dashboard/settings/account", label: "Account" }
];

export default function SettingsLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">Manage PocketSense</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Profile, money preferences, notifications, and account controls in one place.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {settingItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-white/60 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-secondary/70 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {children}
    </section>
  );
}
