import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { prisma } from "@/lib/db/prisma";
import { AgentOrchestrator } from "@/lib/ai/orchestration/agent-orchestrator";
import { logAuditEvent } from "@/lib/services/audit-service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("RECRUITER"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { jobId, rawText, companyName } = await req.json();

    if (!jobId || !rawText) {
      return NextResponse.json(
        { error: "jobId and rawText are required." },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const analysis = await AgentOrchestrator.executeJDAnalysis({
      jobId,
      companyName: companyName || job.company.name,
      rawText,
    });

    await logAuditEvent({
      userId: user.id,
      action: "JD_ANALYSIS",
      entityType: "JOB",
      entityId: jobId,
      details: { title: analysis.jobTitle, difficulty: analysis.difficultyLevel },
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    console.error("JD analysis error:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze JD" }, { status: 500 });
  }
}
