import { NextResponse } from "next/server";

export const GET = () =>
  NextResponse.json({ status: "ok", message: "Server is running" });
