import Link from "next/link";
import { BellRing, CircleDollarSign, Info, Palette, ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    href: "/dashboard/settings/profile",
    title: "Profile",
    description: "Update your avatar, name, university, and phone details.",
    icon: UserRound
  },
  {
    href: "/dashboard/settings/preferences",
    title: "Preferences",
    description: "Language, theme, and budget-cycle preferences.",
    icon: Palette
  },
  {
    href: "/dashboard/settings/notifications",
    title: "Notifications",
    description: "Control in-app, push, email, and SMS alerts.",
    icon: BellRing
  },
  {
    href: "/dashboard/settings/budget",
    title: "Budget Settings",
    description: "Monthly income, savings target, emergency fund, and fixed expenses.",
    icon: CircleDollarSign
  },
  {
    href: "/dashboard/settings/account",
    title: "Account",
    description: "Phone change, data export, delete account, and legal links.",
    icon: ShieldCheck
  },
  {
    href: "/dashboard/settings/profile",
    title: "About",
    description: "PocketSense BD helps students manage money with local-first budgeting habits.",
    icon: Info
  }
];

export default function SettingsPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sections.map((section) => {
        const Icon = section.icon;

        return (
          <Link key={section.title} href={section.href}>
            <Card className="h-full border-white/60 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950/90">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-primary">Open section</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
