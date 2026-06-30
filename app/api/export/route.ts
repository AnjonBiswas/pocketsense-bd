import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/middleware/auth";
import { getSafeErrorMessage } from "@/lib/security/errors";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "export-data",
      limit: 10,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const [
      { data: profile },
      { data: incomes },
      { data: expenses },
      { data: budgets },
      { data: fixedExpenses },
      { data: preferences },
      { data: notificationPreferences },
      { data: notifications },
      { data: squads },
      { data: squadExpenses },
      { data: challenges }
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("incomes").select("*").eq("user_id", user.id),
      supabase.from("expenses").select("*").eq("user_id", user.id),
      supabase.from("budgets").select("*").eq("user_id", user.id),
      supabase.from("budget_fixed_expenses").select("*").eq("user_id", user.id),
      supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("notifications").select("*").eq("user_id", user.id),
      supabase.from("squads").select("*").contains("members", [user.id]),
      supabase.from("squad_expenses").select("*").contains("split_among", [user.id]),
      supabase.from("user_challenges").select("*").eq("user_id", user.id)
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      profile,
      incomes: incomes || [],
      expenses: expenses || [],
      budgets: budgets || [],
      fixedExpenses: fixedExpenses || [],
      preferences,
      notificationPreferences,
      notifications: notifications || [],
      squads: squads || [],
      squadExpenses: squadExpenses || [],
      challenges: challenges || []
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="pocketsense-export-${new Date()
          .toISOString()
          .slice(0, 10)}.json"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to export data.") },
      { status: 500 }
    );
  }
}
