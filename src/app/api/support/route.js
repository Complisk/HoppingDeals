import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const role = String(body.role || "user").trim().toLowerCase();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || body.body || "").trim();

  if (!email || !subject || !message) {
    return NextResponse.json(
      { message: "email, subject, and message are required" },
      { status: 400 },
    );
  }

  // Supabase enum_SupportMessages_senderType only accepts "customer" |
  // "business". The dialog uses "user" because that's the user-facing
  // word; translate it to the DB's enum.
  const senderType = role === "business" ? "business" : "customer";
  const userAgent = req.headers.get("user-agent") || null;
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

  // Production schema declares id/createdAt/updatedAt as NOT NULL with no
  // default — the Sequelize backend always supplied them, and we must too.
  const now = new Date().toISOString();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("SupportMessages")
    .insert({
      id: randomUUID(),
      senderType,
      name: name || (senderType === "business" ? "Business Owner" : "User"),
      email,
      subject,
      body: message,
      ipAddress,
      userAgent,
      meta: {},
      createdAt: now,
      updatedAt: now,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[support] insert failed", error);
    return NextResponse.json(
      {
        message: "Could not save your message. Please try again.",
        // Surface the DB error message in dev only so future failures
        // are easier to diagnose without grepping server logs.
        ...(process.env.NODE_ENV !== "production"
          ? { detail: error.message }
          : {}),
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id, ok: true });
}
