import { NextResponse } from "next/server";
import { authenticateUser, signToken, setSessionCookie } from "@/lib/auth/auth-utils";
import { logAuditEvent } from "@/lib/services/audit-service";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = signToken(user);
    setSessionCookie(token);

    await logAuditEvent({
      userId: user.id,
      action: "USER_LOGIN",
      entityType: "USER",
      entityId: user.id,
      details: { email: user.email, role: user.roles[0] },
    });

    return NextResponse.json({
      success: true,
      user,
      redirectTo: user.roles.includes("ADMIN")
        ? "/admin/dashboard"
        : user.roles.includes("RECRUITER")
        ? "/recruiter/dashboard"
        : "/student/dashboard",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
