import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { AgentOrchestrator } from "@/lib/ai/orchestration/agent-orchestrator";
import { createNotification } from "@/lib/services/notification-service";
import { logAuditEvent } from "@/lib/services/audit-service";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    const whereClause: any = {};
    if (jobId) {
      whereClause.jobId = jobId;
    }

    if (user.roles.includes("STUDENT") && user.studentProfileId) {
      whereClause.studentId = user.studentProfileId;
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        job: { include: { company: true } },
        student: { include: { user: true } },
        resume: true,
        interviews: { include: { evaluation: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required." }, { status: 400 });
    }

    const student = await prisma.studentProfile.findFirst({
      where: { userId: user.id },
      include: {
        resumes: { orderBy: { uploadedAt: "desc" }, take: 1 },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const resume = student.resumes[0];

    // Check existing application
    const existing = await prisma.application.findUnique({
      where: {
        jobId_studentId: {
          jobId,
          studentId: student.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 409 }
      );
    }

    // 1. Create relational Application in PostgreSQL
    const application = await prisma.application.create({
      data: {
        jobId,
        studentId: student.id,
        resumeId: resume?.id || null,
        status: "APPLIED",
      },
      include: { job: { include: { company: true } } },
    });

    // 2. Trigger Candidate Matching Agent (Section 26)
    // Combines semantic retrieval + skill overlap + eligibility
    const matchResult = await AgentOrchestrator.executeCandidateMatch({
      studentId: student.id,
      jobId,
      applicationId: application.id,
    });

    // 3. Notify student
    await createNotification({
      userId: user.id,
      title: `Application Submitted: ${application.job.title}`,
      message: `Your application to ${application.job.company.name} was received. AI Match Score: ${matchResult.overallMatchScore}%. Recommendation: ${matchResult.recommendation}.`,
      type: "SUCCESS",
    });

    await logAuditEvent({
      userId: user.id,
      action: "JOB_APPLICATION",
      entityType: "APPLICATION",
      entityId: application.id,
      details: {
        jobId,
        company: application.job.company.name,
        matchScore: matchResult.overallMatchScore,
      },
    });

    return NextResponse.json({
      success: true,
      application,
      matchResult,
    });
  } catch (err: any) {
    console.error("Application error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
