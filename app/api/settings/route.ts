import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/middleware/auth";
import { getSafeErrorMessage } from "@/lib/security/errors";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import { parsePositiveAmount, sanitizeText } from "@/lib/utils/sanitize";

type SettingsResponse = {
  profile: {
    id: string;
    email: string | null;
    phone: string | null;
    name: string | null;
    university: string | null;
    avatar_url: string | null;
    currency: string;
    theme: string;
    first_day_of_month: number;
  };
  preferences: {
    language: "bn" | "en";
    currency: string;
    theme: "light" | "dark" | "system";
    first_day_of_month: number;
  };
  budget: {
    monthlyIncome: number;
    savingsGoal: number;
    emergencyReserve: number;
    monthlyLimit: number;
    fixedExpenses: Array<{
      id: string;
      title: string;
      amount: number;
      due_day: number | null;
    }>;
  };
};

async function getUserSettings(
  userId: string,
  supabase: ReturnType<typeof createRouteHandlerClient>
): Promise<SettingsResponse> {
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  const [{ data: profile }, { data: preferences }, { data: budget }, { data: fixedExpenses }, { data: incomes }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, phone, name, university, avatar_url, currency, theme, first_day_of_month")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("user_preferences")
        .select("language, currency, theme, first_day_of_month")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("budgets")
        .select("monthly_limit, savings_goal, emergency_reserve")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("budget_fixed_expenses")
        .select("id, title, amount, due_day")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("incomes")
        .select("amount, source, date, is_recurring")
        .eq("user_id", userId)
        .eq("source", "allowance")
        .order("date", { ascending: false })
    ]);

  const latestMonthlyIncome =
    incomes?.find((income) => income.date.startsWith(currentMonthPrefix)) ||
    incomes?.find((income) => income.is_recurring) ||
    incomes?.[0];

  return {
    profile: {
      id: profile?.id || userId,
      email: null,
      phone: profile?.phone || null,
      name: profile?.name || null,
      university: profile?.university || null,
      avatar_url: profile?.avatar_url || null,
      currency: profile?.currency || "BDT",
      theme: profile?.theme || "light",
      first_day_of_month: profile?.first_day_of_month || 1
    },
    preferences: {
      language: preferences?.language || "bn",
      currency: preferences?.currency || profile?.currency || "BDT",
      theme: preferences?.theme || (profile?.theme as "light" | "dark" | "system") || "light",
      first_day_of_month: preferences?.first_day_of_month || profile?.first_day_of_month || 1
    },
    budget: {
      monthlyIncome: Number(latestMonthlyIncome?.amount || 0),
      savingsGoal: Number(budget?.savings_goal || 0),
      emergencyReserve: Number(budget?.emergency_reserve || 0),
      monthlyLimit: Number(budget?.monthly_limit ?? 0),
      fixedExpenses: (fixedExpenses || []).map((item) => ({
        id: item.id,
        title: item.title,
        amount: Number(item.amount),
        due_day: item.due_day
      }))
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "settings-get",
      limit: 120,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;
    const settings = await getUserSettings(user.id, supabase);
    settings.profile.email = user.email || null;

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to load settings.") },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body.section !== "string") {
    return NextResponse.json({ error: "Settings section is required." }, { status: 400 });
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "settings-update",
      limit: 30,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    if (body.section === "profile") {
      const payload: Database["public"]["Tables"]["profiles"]["Update"] = {
        name: sanitizeText(body.name, 80) || null,
        phone: sanitizeText(body.phone, 30) || null,
        university: sanitizeText(body.university, 120) || null
      };

      const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);

      if (error) {
        return NextResponse.json({ error: "Could not update profile." }, { status: 400 });
      }
    }

    if (body.section === "preferences") {
      const theme =
        body.theme === "light" || body.theme === "dark" || body.theme === "system"
          ? body.theme
          : "light";
      const language = body.language === "en" ? "en" : "bn";
      const firstDayOfMonth = Math.min(Math.max(Number(body.first_day_of_month || 1), 1), 31);
      const preferencePayload: Database["public"]["Tables"]["user_preferences"]["Insert"] = {
        user_id: user.id,
        language,
        currency: "BDT",
        theme,
        first_day_of_month: firstDayOfMonth
      };

      const { error: preferenceError } = await supabase
        .from("user_preferences")
        .upsert(preferencePayload, { onConflict: "user_id" });

      if (preferenceError) {
        return NextResponse.json({ error: "Could not update preferences." }, { status: 400 });
      }

      await supabase
        .from("profiles")
        .update({
          currency: "BDT",
          theme,
          first_day_of_month: firstDayOfMonth
        })
        .eq("id", user.id);
    }

    if (body.section === "budget") {
      const monthlyIncome = Math.max(parsePositiveAmount(body.monthlyIncome) || 0, 0);
      const savingsGoal = Math.max(parsePositiveAmount(body.savingsGoal) || 0, 0);
      const emergencyReserve = Math.max(parsePositiveAmount(body.emergencyReserve) || 0, 0);
      const monthlyLimit = Math.max(parsePositiveAmount(body.monthlyLimit) || monthlyIncome, 0);
      const fixedExpenses = Array.isArray(body.fixedExpenses) ? body.fixedExpenses : [];
      const totalFixedExpenses = fixedExpenses.reduce((sum, item) => {
        const typed = item as { amount?: number | string };
        return sum + (parsePositiveAmount(typed.amount) || 0);
      }, 0);

      const { error: budgetError } = await supabase
        .from("budgets")
        .upsert(
          {
            user_id: user.id,
            monthly_limit: monthlyLimit || Math.max(monthlyIncome - totalFixedExpenses, 0),
            savings_goal: savingsGoal,
            emergency_reserve: emergencyReserve
          },
          { onConflict: "user_id" }
        );

      if (budgetError) {
        return NextResponse.json({ error: "Could not update budget settings." }, { status: 400 });
      }

      const fixedExpenseIds = fixedExpenses
        .map((item) => String((item as { id?: string }).id || ""))
        .filter(Boolean);

      if (fixedExpenseIds.length) {
        await supabase
          .from("budget_fixed_expenses")
          .delete()
          .eq("user_id", user.id)
          .not("id", "in", `(${fixedExpenseIds.map((id) => `"${id}"`).join(",")})`);
      } else {
        await supabase.from("budget_fixed_expenses").delete().eq("user_id", user.id);
      }

      if (fixedExpenses.length) {
        await supabase.from("budget_fixed_expenses").upsert(
          fixedExpenses.map((item) => {
            const typed = item as {
              id?: string;
              title?: string;
              amount?: number | string;
              due_day?: number | string | null;
            };

            return {
              id: typed.id || undefined,
              user_id: user.id,
              title: sanitizeText(typed.title, 120) || "Expense item",
              amount: parsePositiveAmount(typed.amount) || 0,
              due_day:
                typed.due_day === null || typed.due_day === undefined || typed.due_day === ""
                  ? null
                  : Number(typed.due_day)
            };
          }),
          { onConflict: "id" }
        );
      }

      const incomeDate = `${new Date().toISOString().slice(0, 7)}-01`;
      const { data: allowanceRow } = await supabase
        .from("incomes")
        .select("id")
        .eq("user_id", user.id)
        .eq("source", "allowance")
        .eq("date", incomeDate)
        .maybeSingle();

      if (allowanceRow?.id) {
        await supabase
          .from("incomes")
          .update({
            amount: monthlyIncome,
            note: "Default monthly income",
            is_recurring: true
          })
          .eq("id", allowanceRow.id)
          .eq("user_id", user.id);
      } else if (monthlyIncome > 0) {
        await supabase.from("incomes").insert({
          user_id: user.id,
          amount: monthlyIncome,
          source: "allowance",
          date: incomeDate,
          note: "Default monthly income",
          is_recurring: true
        });
      }
    }

    const settings = await getUserSettings(user.id, supabase);
    settings.profile.email = user.email || null;

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to update settings.") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "settings-avatar",
      limit: 15,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Avatar file is required." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const path = `${user.id}/avatar-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: true
    });

    if (uploadError) {
      return NextResponse.json({ error: "Could not upload avatar." }, { status: 400 });
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatar_url = publicUrlData.publicUrl;

    const { error: profileError } = await supabase.from("profiles").update({ avatar_url }).eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: "Could not save avatar." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      avatar_url
    });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to upload avatar.") },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "settings-delete-account",
      limit: 10,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    await Promise.all([
      supabase
        .from("profiles")
        .update({
          name: "Deleted User",
          university: null,
          phone: null,
          avatar_url: null,
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq("id", user.id),
      supabase.from("notifications").delete().eq("user_id", user.id),
      supabase.from("notification_preferences").delete().eq("user_id", user.id),
      supabase.from("sos_modes").delete().eq("user_id", user.id),
      supabase.from("user_preferences").delete().eq("user_id", user.id)
    ]);

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to delete account.") },
      { status: 500 }
    );
  }
}

