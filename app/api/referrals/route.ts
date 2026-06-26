import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { generateReferralCode } from "@/lib/utils/referral";

async function ensureReferralSeed(userId: string, name: string | null, supabase: ReturnType<typeof createRouteHandlerClient>) {
  const referralCode = generateReferralCode(userId, name);
  const { data: existing } = await supabase
    .from("referrals")
    .select("id")
    .eq("referrer_user_id", userId)
    .eq("referral_code", referralCode)
    .is("referred_user_id", null)
    .limit(1);

  if (!existing?.length) {
    await supabase.from("referrals").insert({
      referrer_user_id: userId,
      referral_code: referralCode,
      status: "pending",
      reward_xp: 500
    });
  }

  return referralCode;
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ code: null, stats: { signups: 0, pending: 0, rewardXp: 0 } });
    }

    const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
    const code = await ensureReferralSeed(user.id, profile?.name || null, supabase);
    const { data: rows, error } = await supabase
      .from("referrals")
      .select("status, reward_xp, referred_user_id")
      .eq("referrer_user_id", user.id)
      .eq("referral_code", code)
      .not("referred_user_id", "is", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const completed = (rows || []).filter((row) => row.status === "completed");
    const pending = (rows || []).filter((row) => row.status === "pending");

    return NextResponse.json({
      code,
      stats: {
        signups: completed.length,
        pending: pending.length,
        rewardXp: completed.reduce((sum, row) => sum + Number(row.reward_xp || 0), 0)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load referrals." },
      { status: 500 }
    );
  }
}
