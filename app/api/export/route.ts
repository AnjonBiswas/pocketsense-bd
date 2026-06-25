import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

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
      { error: error instanceof Error ? error.message : "Failed to export data." },
      { status: 500 }
    );
  }
}
