import { NextResponse } from "next/server";
import { requireSession } from "@/server/http/auth-guard";
import { withErrors } from "@/server/http/handle";
import { createAdminClient } from "@/utils/supabase/server";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

// GET /api/business/promotion-templates -> list templates owned by the
// current business. Service-role client because we already enforced
// auth via the session cookie and we want to bypass RLS.
export const GET = withErrors(async () => {
  const session = await requireSession("business");
  const businessId = session.business.id;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("BusinessPromotionTemplates")
    .select("*")
    .eq("businessId", businessId)
    .order("createdAt", { ascending: false });
  if (error) throw error;
  return NextResponse.json(data ?? []);
});

// POST /api/business/promotion-templates -> save a new template.
export const POST = withErrors(async (req) => {
  const session = await requireSession("business");
  const businessId = session.business.id;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const imageUrl = String(body.imageUrl || "").trim();
  const backgroundColor = String(body.backgroundColor || "");
  const text = Array.isArray(body.text) ? body.text : [];

  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }
  if (!imageUrl && !backgroundColor) {
    return NextResponse.json(
      { message: "Pick a background image or color" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("BusinessPromotionTemplates")
    .insert({
      id: randomUUID(),
      businessId,
      name,
      imageUrl,
      text,
      backgroundColor,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();
  if (error) throw error;

  return NextResponse.json(data);
});
