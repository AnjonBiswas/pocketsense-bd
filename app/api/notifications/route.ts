import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/middleware/auth";
import { getSafeErrorMessage } from "@/lib/security/errors";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import {
  filterNotificationsByPreference,
  generateNotifications
} from "@/lib/notifications/notificationService";
import { getSOSState } from "@/lib/sos/get-sos-state";
import type { DebtRecord, ReminderRecord } from "@/lib/utils/alerts";

async function readOptionalRows(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  table: "reminders" | "debts",
  userId: string
) {
  const client = supabase as unknown as {
    from: (tableName: string) => {
      select: (columns: string) => {
        eq: (
          column: string,
          value: string
        ) => Promise<{ data: Record<string, unknown>[] | null; error: { message: string } | null }>;
      };
    };
  };

  const selection =
    table === "reminders"
      ? "id, user_id, kind, title, note, due_date, amount, status, created_at"
      : "id, user_id, friend_name, amount, direction, due_date, note, status, created_at";
  const { data } = await client.from(table).select(selection).eq("user_id", userId);
  return data || [];
}

export async function GET(request: NextRequest) {
  const shouldSeed = request.nextUrl.searchParams.get("seed") === "true";

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "notifications-list",
      limit: 90,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;
    const [{ data: notifications }, { data: preference }] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, user_id, type, title, message, read, action_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
    ]);

    const currentNotifications = notifications || [];

    if (!currentNotifications.length || shouldSeed) {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
      const [{ data: expenses }, { data: incomes }, { data: budget }, reminders, debts, { data: challenges }, sos] =
        await Promise.all([
          supabase
            .from("expenses")
            .select("id, amount, category, note, date, created_at")
            .eq("user_id", user.id)
            .gte("date", monthStart)
            .lte("date", monthEnd),
          supabase
            .from("incomes")
            .select("id, amount, source, date, note, is_recurring, created_at")
            .eq("user_id", user.id)
            .gte("date", monthStart)
            .lte("date", monthEnd),
          supabase
            .from("budgets")
            .select("monthly_limit, savings_goal, emergency_reserve")
            .eq("user_id", user.id)
            .maybeSingle(),
          readOptionalRows(supabase, "reminders", user.id),
          readOptionalRows(supabase, "debts", user.id),
          supabase
            .from("user_challenges")
            .select("status")
            .eq("user_id", user.id)
            .eq("status", "completed"),
          getSOSState(supabase, user.id)
        ]);

      const generated = filterNotificationsByPreference(
        generateNotifications({
          userId: user.id,
          expenses: (expenses || []).map((expense) => ({
            ...expense,
            amount: Number(expense.amount)
          })),
          incomes: (incomes || []).map((income) => ({
            ...income,
            amount: Number(income.amount)
          })),
          budget: {
            monthly_limit: Number(budget?.monthly_limit ?? 0),
            savings_goal: Number(budget?.savings_goal ?? 0),
            emergency_reserve: Number(budget?.emergency_reserve ?? 0)
          },
          reminders: reminders as ReminderRecord[],
          debts: debts as DebtRecord[],
          streak: sos.isActive ? Math.round(sos.complianceScore / 10) : 0,
          completedChallenges: (challenges || []).length,
          currentDate: today
        }),
        preference
      );

      if (generated.length) {
        await supabase.from("notifications").insert(generated);
      }
    }

    const { data: freshNotifications } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, message, read, action_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const safeNotifications = freshNotifications || [];

    return NextResponse.json({
      notifications: safeNotifications,
      unreadCount: safeNotifications.filter((item) => !item.read).length
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: getSafeErrorMessage(error, "Failed to fetch notifications.")
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { id?: string } | null;

  if (!body?.id) {
    return NextResponse.json({ error: "Notification id is required." }, { status: 400 });
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "notifications-update",
      limit: 60,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", body.id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Could not update notification." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: getSafeErrorMessage(error, "Failed to update notification.")
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "notifications-clear",
      limit: 20,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;
    const { error } = await supabase.from("notifications").delete().eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Could not clear notifications." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: getSafeErrorMessage(error, "Failed to clear notifications.")
      },
      { status: 500 }
    );
  }
}

