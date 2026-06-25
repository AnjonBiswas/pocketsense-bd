import { NextRequest, NextResponse } from "next/server";
import {
  buildSOSUpsertPayload,
  buildSurvivalTipPayload,
  getSOSState,
  hashPIN
} from "@/lib/sos/get-sos-state";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { isLuxuryCategory } from "@/lib/utils/sosMode";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const state = await getSOSState(supabase, user?.id);

    if (user?.id && state.isActive && !state.shouldActivate) {
      await supabase
        .from("sos_modes")
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      ...state,
      tips: buildSurvivalTipPayload(state.activatedTips)
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load SOS mode."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        action?: "activate" | "deactivate" | "unlock" | "track";
        tipsActivated?: string[];
        pin?: string;
        lockedAmount?: number;
        category?: string;
      }
    | null;

  if (!body?.action) {
    return NextResponse.json({ error: "Action is required." }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const state = await getSOSState(supabase, user?.id);

    if (!user?.id) {
      return NextResponse.json({
        success: true,
        state
      });
    }

    if (body.action === "activate") {
      const tipsActivated = Array.isArray(body.tipsActivated) ? body.tipsActivated : [];
      const lockedAmount = Math.max(Number(body.lockedAmount || 0), 0);
      const payload = buildSOSUpsertPayload({
        userId: user.id,
        state,
        tipsActivated,
        lockedAmount,
        pin: body.pin
      });

      const { data, error } = await supabase
        .from("sos_modes")
        .upsert(payload, { onConflict: "user_id" })
        .select(
          "id, user_id, is_active, severity, remaining_budget, days_remaining, activated_tips, locked_amount, lock_pin_hash, compliance_score, activated_at, updated_at, deactivated_at"
        )
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        record: data,
        state: await getSOSState(supabase, user.id)
      });
    }

    if (body.action === "deactivate") {
      const { error } = await supabase
        .from("sos_modes")
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        state: await getSOSState(supabase, user.id)
      });
    }

    if (body.action === "unlock") {
      const { data: record, error } = await supabase
        .from("sos_modes")
        .select("lock_pin_hash, locked_amount")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (!record?.lock_pin_hash) {
        return NextResponse.json({ success: true, unlocked: true });
      }

      const isValid = body.pin ? hashPIN(body.pin) === record.lock_pin_hash : false;

      if (!isValid) {
        return NextResponse.json({ error: "Incorrect PIN." }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        unlocked: true,
        lockedAmount: Number(record.locked_amount || 0)
      });
    }

    if (body.action === "track") {
      const scoreDelta = body.category && isLuxuryCategory(body.category) ? -20 : 8;
      const nextScore = Math.max(0, Math.min(100, state.complianceScore + scoreDelta));

      const { error } = await supabase
        .from("sos_modes")
        .update({
          compliance_score: nextScore,
          remaining_budget: state.remainingBudget,
          days_remaining: state.daysRemaining
        })
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        state: await getSOSState(supabase, user.id)
      });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update SOS mode."
      },
      { status: 500 }
    );
  }
}
