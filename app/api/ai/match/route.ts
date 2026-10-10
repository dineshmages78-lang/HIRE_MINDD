import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { AgentOrchestrator } from "@/lib/ai/orchestration/agent-orchestrator";
import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/services/audit-service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, jobId, applicationId } = await req.json();

    if (!studentId || !jobId) {
      return NextResponse.json(
        { error: "studentId and jobId are required." },
        { status: 400 }
      );
    }

    const matchResult = await AgentOrchestrator.executeCandidateMatch({
      studentId,
      jobId,
      applicationId,
    });

    await logAuditEvent({
      userId: user.id,
      action: "CANDIDATE_MATCH_EVALUATION",
      entityType: "APPLICATION",
      entityId: applicationId || `${studentId}_${jobId}`,
      details: {
        score: matchResult.overallMatchScore,
        recommendation: matchResult.recommendation,
      },
    });

    return NextResponse.json({
      success: true,
      matchResult,
    });
  } catch (err: any) {
    console.error("Matching error:", err);
    return NextResponse.json({ error: err.message || "Failed to execute candidate matching" }, { status: 500 });
  }
}
