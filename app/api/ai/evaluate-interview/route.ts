import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { AgentOrchestrator } from "@/lib/ai/orchestration/agent-orchestrator";
import { logAuditEvent } from "@/lib/services/audit-service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }

    const evaluation = await AgentOrchestrator.executeInterviewEvaluation({
      sessionId,
    });

    await logAuditEvent({
      userId: user.id,
      action: "INTERVIEW_EVALUATED",
      entityType: "INTERVIEW_SESSION",
      entityId: sessionId,
      details: { overallScore: evaluation.overallScore, decision: evaluation.decision },
    });

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (err: any) {
    console.error("Evaluation error:", err);
    return NextResponse.json({ error: err.message || "Failed to evaluate interview" }, { status: 500 });
  }
}
