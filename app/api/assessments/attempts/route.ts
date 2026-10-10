import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth-utils";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("attemptId");
    const assessmentId = searchParams.get("assessmentId");

    if (attemptId) {
      const attempt = await prisma.assessmentAttempt.findUnique({
        where: { id: attemptId },
        include: {
          assessment: { include: { job: { include: { company: true } } } },
          responses: { include: { question: true } },
        },
      });
      return NextResponse.json({ attempt });
    }

    // If student, get their attempts
    let studentId = user.studentProfileId;
    if (!studentId) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });
      studentId = studentProfile?.id;
    }

    if (studentId) {
      const attempts = await prisma.assessmentAttempt.findMany({
        where: {
          studentId,
          ...(assessmentId ? { assessmentId } : {}),
        },
        include: {
          assessment: { include: { job: { include: { company: true } } } },
          responses: true,
        },
        orderBy: { startedAt: "desc" },
      });
      return NextResponse.json({ attempts });
    }

    return NextResponse.json({ attempts: [] });
  } catch (err: any) {
    console.error("Fetch attempts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assessmentId } = await req.json();
    if (!assessmentId) {
      return NextResponse.json({ error: "assessmentId is required." }, { status: 400 });
    }

    // Find student profile
    let studentId = user.studentProfileId;
    if (!studentId) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });
      studentId = studentProfile?.id;
    }

    // Fallback: If logged in as admin/recruiter testing the student view, grab first student
    if (!studentId) {
      const fallbackStudent = await prisma.studentProfile.findFirst();
      studentId = fallbackStudent?.id;
    }

    if (!studentId) {
      return NextResponse.json(
        { error: "No student profile found for this user." },
        { status: 404 }
      );
    }

    // Verify assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: { where: { status: "APPROVED" } } },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // Check for existing IN_PROGRESS attempt
    let attempt = await prisma.assessmentAttempt.findFirst({
      where: {
        assessmentId,
        studentId,
        status: "IN_PROGRESS",
      },
      include: {
        responses: { select: { questionId: true, isCorrect: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    if (!attempt) {
      // Create fresh attempt
      attempt = await prisma.assessmentAttempt.create({
        data: {
          assessmentId,
          studentId,
          status: "IN_PROGRESS",
          currentDifficulty: "MEDIUM",
          startedAt: new Date(),
        },
        include: {
          responses: { select: { questionId: true, isCorrect: true } },
        },
      });
    }

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        assessmentId: attempt.assessmentId,
        studentId: attempt.studentId,
        status: attempt.status,
        currentDifficulty: attempt.currentDifficulty,
        answeredCount: attempt.responses.length,
        startedAt: attempt.startedAt,
      },
    });
  } catch (err: any) {
    console.error("Create assessment attempt error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
