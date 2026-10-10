import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/auth-utils";

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ success: true });
}
