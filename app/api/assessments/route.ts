import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { AgentOrchestrator } from "@/lib/ai/orchestration/agent-orchestrator";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const assessment = await prisma.assessment.findUnique({
        where: { id },
        include: {
          job: { include: { company: true } },
          questions: { where: { status: "APPROVED" } },
        },
      });
      return NextResponse.json({ assessment });
    }

    const assessments = await prisma.assessment.findMany({
      include: {
        job: { include: { company: true } },
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assessments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("RECRUITER"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { jobId, title, durationMinutes, passingScore, targetSkills, difficulty, numQuestions } =
      await req.json();

    if (!jobId || !title) {
      return NextResponse.json(
        { error: "jobId and title are required." },
        { status: 400 }
      );
    }

    // 1. Create relational Assessment in PostgreSQL
    const assessment = await prisma.assessment.create({
      data: {
        jobId,
        title,
        durationMinutes: parseInt(durationMinutes, 10) || 30,
        passingScore: parseFloat(passingScore) || 60.0,
        totalQuestions: parseInt(numQuestions, 10) || 5,
      },
    });

    // 2. Trigger Question Generation Agent!
    const questions = await AgentOrchestrator.executeQuestionGeneration({
      assessmentId: assessment.id,
      jobId,
      targetSkills: targetSkills || ["Python", "SQL", "Data Structures"],
      difficulty: difficulty || "MEDIUM",
      numQuestions: parseInt(numQuestions, 10) || 5,
      autoApprove: true, // auto-approve so it is immediately playable
    });

    return NextResponse.json({
      success: true,
      assessment,
      generatedCount: questions.length,
    });
  } catch (err: any) {
    console.error("Assessment creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
