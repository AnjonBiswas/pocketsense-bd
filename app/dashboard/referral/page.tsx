import { ThemeIllustration } from "@/components/features/ThemeIllustration";
import { ReferralCenter } from "@/components/features/ReferralCenter";
import { createServerComponentClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { generateReferralCode } from "@/lib/utils/referral";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  let userId = "guest-pocket";
  let profileName: string | null | undefined;

  if (hasSupabaseEnv()) {
    try {
      const supabase = createServerComponentClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;
        const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
        profileName = profile?.name;
      }
    } catch {}
  }

  const code = generateReferralCode(userId, profileName);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Referral</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">Invite your friends, grow your XP</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Share PocketSense with classmates. Every completed signup can unlock +500 XP for both of you and make the leaderboard a little more fun.
          </p>
        </div>
        <div className="rounded-[32px] border border-white/60 bg-white/90 p-4 shadow-sm">
          <ThemeIllustration
            lightSrc="/illustrations/referral-light.svg"
            darkSrc="/illustrations/referral-dark.svg"
            alt="Referral illustration"
            className="mx-auto h-48 w-full object-contain"
          />
        </div>
      </div>

      <ReferralCenter code={code} />
    </section>
  );
}
