import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/middleware/auth";
import { getSafeErrorMessage } from "@/lib/security/errors";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "expense-templates-list",
      limit: 60,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("expense_templates")
      .select("id, title, amount, category, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      templates: (data || []).map((template) => ({
        ...template,
        amount: Number(template.amount)
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to load templates.") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        title?: string;
        amount?: number;
        category?: string;
        note?: string;
      }
    | null;

  if (!body?.title?.trim() || !body.amount || !body.category) {
    return NextResponse.json({ error: "Title, amount, and category are required." }, { status: 400 });
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "expense-templates-create",
      limit: 30,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("expense_templates")
      .insert({
        user_id: user.id,
        title: body.title.trim(),
        amount: Number(body.amount),
        category: body.category,
        note: body.note?.trim() || null
      })
      .select("id, title, amount, category, note, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      template: {
        ...data,
        amount: Number(data.amount)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to save template.") },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Template id is required." }, { status: 400 });
  }

  try {
    const auth = await requireApiUser(request, {
      rateLimitKey: "expense-templates-delete",
      limit: 30,
      windowMs: 60_000
    });

    if (auth.error) {
      return auth.error;
    }

    const { supabase, user } = auth;

    const { error } = await supabase.from("expense_templates").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Could not delete template." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to delete template.") },
      { status: 500 }
    );
  }
}
