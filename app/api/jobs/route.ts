import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { getMongoCollection, COLLECTIONS } from "@/lib/db/mongodb";
import { AgentOrchestrator } from "@/lib/ai/orchestration/agent-orchestrator";
import { logAuditEvent } from "@/lib/services/audit-service";

export async function GET(req: Request) {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: true,
        assessments: {
          select: { id: true, title: true, totalQuestions: true, durationMinutes: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mongoJdDocs = await getMongoCollection(COLLECTIONS.JOB_DESCRIPTIONS);
    const enrichedJobs = await Promise.all(
      jobs.map(async (j) => {
        const doc = await mongoJdDocs.findOne({ jobId: j.id });
        return {
          ...j,
          requirements: doc?.requirements || { technicalSkills: [] },
          aiSummary: doc?.aiAnalysis?.summary || "",
        };
      })
    );

    return NextResponse.json({ jobs: enrichedJobs });
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

    const { companyId, title, department, location, minCgpa, deadlineDays, rawJdText } =
      await req.json();

    if (!companyId || !title) {
      return NextResponse.json(
        { error: "companyId and title are required." },
        { status: 400 }
      );
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (parseInt(deadlineDays, 10) || 30));

    // 1. Create relational Job in PostgreSQL
    const job = await prisma.job.create({
      data: {
        companyId,
        title,
        department: department || "Engineering",
        location: location || "Hybrid",
        minCgpa: parseFloat(minCgpa) || 6.5,
        deadline,
        status: "OPEN",
      },
      include: { company: true },
    });

    // 2. If raw JD text was provided, automatically trigger JD Analysis Agent!
    if (rawJdText && rawJdText.trim().length > 10) {
      await AgentOrchestrator.executeJDAnalysis({
        jobId: job.id,
        companyName: job.company.name,
        rawText: rawJdText,
      });
    }

    await logAuditEvent({
      userId: user.id,
      action: "CREATE_JOB",
      entityType: "JOB",
      entityId: job.id,
      details: { title: job.title, company: job.company.name },
    });

    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    console.error("Create job error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
