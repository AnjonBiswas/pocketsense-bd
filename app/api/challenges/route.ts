import { endOfMonth, format, startOfMonth } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { CHALLENGES, type ChallengeDefinition } from "@/data/challenges";
import { applyCacheHeaders } from "@/lib/middleware/cache";
import { createRouteHandlerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { checkChallengeProgress } from "@/lib/utils/challengeTracker";
import { calculateBudgetStreak } from "@/lib/utils/streakCalculator";
import { FALLBACK_EXPENSES, normalizeExpense } from "@/lib/utils/expenses";

export const dynamic = "force-dynamic";

type UserChallengeRow = {
  id: string;
  challenge_type: string;
  progress: number;
  target: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  user_id: string;
};

type GamificationProfile = {
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  badges: string[];
};

function getFallbackProfile(): GamificationProfile {
  return {
    xp: 1800,
    level: 1,
    current_streak: 5,
    longest_streak: 12,
    badges: ["canteen-master", "green-commuter"]
  };
}

function buildChallengePayload(
  definition: ChallengeDefinition,
  row: UserChallengeRow | null,
  profile: GamificationProfile
) {
  return {
    ...definition,
    userChallengeId: row?.id || null,
    progress: row?.progress || 0,
    target: row?.target || definition.target,
    status: (row?.status as "active" | "completed" | "failed" | undefined) || "available",
    completedAt: row?.completed_at || null,
    startedAt: row?.started_at || null,
    unlocked: profile.badges.includes(definition.badge)
  };
}

async function syncChallengesForUser(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  userId: string
) {
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const [{ data: profileRow }, { data: challengeRows }, { data: expenseRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("xp, level, current_streak, longest_streak, badges")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("user_challenges")
      .select("id, challenge_type, progress, target, status, started_at, completed_at, user_id")
      .eq("user_id", userId),
    supabase
      .from("expenses")
      .select("id, amount, category, note, date, created_at")
      .eq("user_id", userId)
      .gte("date", monthStart)
      .lte("date", monthEnd)
  ]);

  const profile: GamificationProfile = {
    xp: Number(profileRow?.xp || 0),
    level: Number(profileRow?.level || 0),
    current_streak: Number(profileRow?.current_streak || 0),
    longest_streak: Number(profileRow?.longest_streak || 0),
    badges: Array.isArray(profileRow?.badges) ? profileRow.badges : []
  };
  const expenses = (expenseRows || []).map((expense) => normalizeExpense(expense));
  const rows = (challengeRows || []) as UserChallengeRow[];

  const dailyBudgetMap = expenses.reduce<Record<string, number>>((accumulator, expense) => {
    accumulator[expense.date] = 300;
    return accumulator;
  }, {});
  const streak = calculateBudgetStreak(expenses, dailyBudgetMap, profile.longest_streak);

  const unlockedBadges = new Set(profile.badges);
  let xp = profile.xp;

  const syncedRows = await Promise.all(
    rows.map(async (row) => {
      const definition = CHALLENGES.find((challenge) => challenge.id === row.challenge_type);
      if (!definition || row.status === "completed") return row;

      const result = checkChallengeProgress(definition, expenses, 300);
      const nextStatus = result.completed ? "completed" : "active";

      if (nextStatus === "completed" && row.status !== "completed") {
        xp += definition.xp;
        unlockedBadges.add(definition.badge);
      }

      const { data } = await supabase
        .from("user_challenges")
        .update({
          progress: result.progress,
          status: nextStatus,
          completed_at: result.completed ? new Date().toISOString() : null
        })
        .eq("id", row.id)
        .select("id, challenge_type, progress, target, status, started_at, completed_at, user_id")
        .single();

      return (data as UserChallengeRow) || {
        ...row,
        progress: result.progress,
        status: nextStatus,
        completed_at: result.completed ? new Date().toISOString() : null
      };
    })
  );

  const nextProfile: GamificationProfile = {
    xp,
    level: Math.floor(xp / 1000),
    current_streak: streak.currentStreak,
    longest_streak: Math.max(profile.longest_streak, streak.longestStreak),
    badges: [...unlockedBadges]
  };

  await supabase
    .from("profiles")
    .update({
      xp: nextProfile.xp,
      level: nextProfile.level,
      current_streak: nextProfile.current_streak,
      longest_streak: nextProfile.longest_streak,
      badges: nextProfile.badges
    })
    .eq("id", userId);

  const active = CHALLENGES.map((definition) =>
    buildChallengePayload(
      definition,
      syncedRows.find((row) => row.challenge_type === definition.id) || null,
      nextProfile
    )
  );

  return {
    profile: nextProfile,
    streak,
    challenges: active
  };
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    const profile = getFallbackProfile();
    const streak = calculateBudgetStreak(FALLBACK_EXPENSES, {}, profile.longest_streak);
    const challenges = CHALLENGES.map((definition, index) =>
      buildChallengePayload(
        definition,
        index < 2
          ? {
              id: `fallback-${definition.id}`,
              challenge_type: definition.id,
              progress: Math.min(index + 2, definition.target),
              target: definition.target,
              status: index === 0 ? "active" : "completed",
              started_at: new Date().toISOString(),
              completed_at: index === 1 ? new Date().toISOString() : null,
              user_id: "guest"
            }
          : null,
        profile
      )
    );

    return applyCacheHeaders(NextResponse.json({
      profile,
      streak,
      activeChallenges: challenges.filter((challenge) => challenge.status === "active"),
      availableChallenges: challenges.filter((challenge) => challenge.status === "available"),
      completedChallenges: challenges.filter((challenge) => challenge.status === "completed")
    }), { maxAge: 300, staleWhileRevalidate: 900, isPrivate: false });
  }

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const profile = getFallbackProfile();
      const streak = calculateBudgetStreak(FALLBACK_EXPENSES, {}, profile.longest_streak);
      const challenges = CHALLENGES.map((definition, index) =>
        buildChallengePayload(
          definition,
          index < 2
            ? {
                id: `fallback-${definition.id}`,
                challenge_type: definition.id,
                progress: Math.min(index + 2, definition.target),
                target: definition.target,
                status: index === 0 ? "active" : "completed",
                started_at: new Date().toISOString(),
                completed_at: index === 1 ? new Date().toISOString() : null,
                user_id: "guest"
              }
            : null,
          profile
        )
      );

      return applyCacheHeaders(NextResponse.json({
        profile,
        streak,
        activeChallenges: challenges.filter((challenge) => challenge.status === "active"),
        availableChallenges: challenges.filter((challenge) => challenge.status === "available"),
        completedChallenges: challenges.filter((challenge) => challenge.status === "completed")
      }), { maxAge: 300, staleWhileRevalidate: 900, isPrivate: false });
    }

    const synced = await syncChallengesForUser(supabase, user.id);
    return NextResponse.json({
      profile: synced.profile,
      streak: synced.streak,
      activeChallenges: synced.challenges.filter((challenge) => challenge.status === "active"),
      availableChallenges: synced.challenges.filter((challenge) => challenge.status === "available"),
      completedChallenges: synced.challenges.filter((challenge) => challenge.status === "completed")
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load challenges." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { challengeId?: string } | null;

  if (!body?.challengeId) {
    return NextResponse.json({ error: "Challenge id is required." }, { status: 400 });
  }

  const definition = CHALLENGES.find((challenge) => challenge.id === body.challengeId);
  if (!definition) {
    return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
  }

  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ success: true, challengeId: body.challengeId, guest: true });
    }

    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, challengeId: body.challengeId, guest: true });
    }

    const { data: existing } = await supabase
      .from("user_challenges")
      .select("id")
      .eq("user_id", user.id)
      .eq("challenge_type", body.challengeId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, challengeId: body.challengeId, alreadyStarted: true });
    }

    const { error } = await supabase.from("user_challenges").insert({
      user_id: user.id,
      challenge_type: body.challengeId,
      target: definition.target,
      progress: 0,
      status: "active"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, challengeId: body.challengeId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start challenge." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { challengeId?: string } | null;

  if (!body?.challengeId) {
    return NextResponse.json({ error: "Challenge id is required." }, { status: 400 });
  }

  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ success: true, guest: true });
    }

    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, guest: true });
    }

    const synced = await syncChallengesForUser(supabase, user.id);
    const challenge = synced.challenges.find((item) => item.id === body.challengeId);

    return NextResponse.json({
      success: true,
      challenge,
      profile: synced.profile,
      unlockedBadge: challenge?.status === "completed" ? challenge.badge : null
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update challenge progress." },
      { status: 500 }
    );
  }
}
