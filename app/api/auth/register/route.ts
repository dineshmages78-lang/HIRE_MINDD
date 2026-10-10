import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth/auth-utils";
import { logAuditEvent } from "@/lib/services/audit-service";
import { RoleType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      studentId,
      college,
      department,
      degree,
      graduationYear,
      cgpa,
      location,
    } = body;

    if (!email || !password || !firstName || !lastName || !studentId) {
      return NextResponse.json(
        { error: "Missing mandatory registration fields." },
        { status: 400 }
      );
    }

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Ensure STUDENT role exists
    let studentRole = await prisma.role.findUnique({
      where: { name: RoleType.STUDENT },
    });
    if (!studentRole) {
      studentRole = await prisma.role.create({
        data: { name: RoleType.STUDENT },
      });
    }

    const passwordHash = await hashPassword(password);

    // Create user and student profile in relational transaction
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName,
        lastName,
        phone,
        roles: {
          create: {
            roleId: studentRole.id,
          },
        },
        student: {
          create: {
            studentId,
            college: college || "National Institute of Technology",
            department: department || "Computer Science",
            degree: degree || "B.Tech",
            graduationYear: parseInt(graduationYear, 10) || 2025,
            cgpa: parseFloat(cgpa) || 7.5,
            location: location || "India",
          },
        },
      },
      include: {
        student: true,
        roles: { include: { role: true } },
      },
    });

    const sessionUser = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      roles: ["STUDENT" as const],
      studentProfileId: newUser.student?.id,
    };

    const token = signToken(sessionUser);
    setSessionCookie(token);

    await logAuditEvent({
      userId: newUser.id,
      action: "STUDENT_REGISTRATION",
      entityType: "STUDENT_PROFILE",
      entityId: newUser.student?.id,
      details: { email: newUser.email, studentId },
    });

    return NextResponse.json({
      success: true,
      user: sessionUser,
      redirectTo: "/student/dashboard",
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to register student." },
      { status: 500 }
    );
  }
}
