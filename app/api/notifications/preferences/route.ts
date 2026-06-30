import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/middleware/auth";
import { getSafeErrorMessage } from "@/lib/security/errors";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications/notificationService";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "notification-preferences-get",
      limit: 60,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json(data || DEFAULT_NOTIFICATION_PREFERENCES);
  } catch (error) {
    return NextResponse.json(
      {
        error: getSafeErrorMessage(error, "Failed to fetch notification preferences.")
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "notification-preferences-update",
      limit: 30,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const payload = {
      user_id: user.id,
      daily_budget: body.daily_budget === undefined ? true : Boolean(body.daily_budget),
      overspending: body.overspending === undefined ? true : Boolean(body.overspending),
      bill_due: body.bill_due === undefined ? true : Boolean(body.bill_due),
      tuition: body.tuition === undefined ? true : Boolean(body.tuition),
      friend_owed: body.friend_owed === undefined ? true : Boolean(body.friend_owed),
      challenge_completion:
        body.challenge_completion === undefined ? true : Boolean(body.challenge_completion),
      streak_milestone: body.streak_milestone === undefined ? true : Boolean(body.streak_milestone),
      month_end_summary: body.month_end_summary === undefined ? true : Boolean(body.month_end_summary),
      push_enabled: body.push_enabled === undefined ? false : Boolean(body.push_enabled),
      email_enabled: body.email_enabled === undefined ? false : Boolean(body.email_enabled),
      sms_enabled: body.sms_enabled === undefined ? false : Boolean(body.sms_enabled),
      frequency:
        body.frequency === "daily" || body.frequency === "weekly" ? body.frequency : "immediate"
    } as const;

    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Could not update notification preferences." }, { status: 400 });
    }

    return NextResponse.json({ success: true, preference: data });
  } catch (error) {
    return NextResponse.json(
      {
        error: getSafeErrorMessage(error, "Failed to update notification preferences.")
      },
      { status: 500 }
    );
  }
}
