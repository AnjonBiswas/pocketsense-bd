import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import { ExpenseToast } from "@/components/dashboard/ExpenseToast";
import { DashboardEmergencyShell } from "@/components/features/DashboardEmergencyShell";
import { Navbar } from "@/components/dashboard/Navbar";
import { NotificationBannerShell } from "@/components/notifications/NotificationBannerShell";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FAB } from "@/components/ui/FAB";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { createServerComponentClient } from "@/lib/supabase/server";

function getDisplayName({
  profileName,
  fullName,
  email
}: {
  profileName?: string | null;
  fullName?: string | null;
  email?: string | null;
}) {
  return (
    profileName?.trim() ||
    fullName?.trim() ||
    (email ? email.split("@")[0] : "") ||
    "PocketSense User"
  );
}

const AddExpenseModal = dynamic(
  () => import("@/components/modals/AddExpenseModal").then((module) => module.AddExpenseModal),
  { ssr: false }
);

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerComponentClient();
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | null = null;
  let profile: {
    name: string | null;
    phone: string | null;
    avatar_url: string | null;
    onboarding_completed: boolean | null;
  } | null = null;

  try {
    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;

    if (user) {
      const profileResult = await supabase
        .from("profiles")
        .select("name, phone, avatar_url, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      profile = profileResult.data;
    }
  } catch {
    user = null;
    profile = null;
  }

  if (!user) {
    redirect("/auth/login");
  }

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const userName = getDisplayName({
    profileName: profile?.name,
    fullName: user?.user_metadata?.full_name || user?.user_metadata?.name,
    email: user?.email
  });
  const userPhone = profile?.phone || user?.phone || user?.email || "—";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  return (
    <LanguageProvider initialLanguage="bn">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,216,125,0.65),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.18),transparent_28%),linear-gradient(180deg,#f9fcf7_0%,#fff8ef_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_26%),linear-gradient(180deg,#07111f_0%,#0f172a_100%)]">
        <Navbar userName={userName} userPhone={userPhone} avatarUrl={avatarUrl} />
        <MobileSidebar userName={userName} />
        <div className="mx-auto flex min-h-[calc(100vh-81px)] max-w-[1600px]">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="flex-1 px-4 py-5 pb-28 md:px-6 xl:px-8 xl:py-8 xl:pb-8">
              <NotificationBannerShell />
              <DashboardEmergencyShell />
              {children}
            </main>
          </div>
        </div>
        <BottomNav />
        <FAB />
        <ExpenseToast />
        <AddExpenseModal />
      </div>
    </LanguageProvider>
  );
}
