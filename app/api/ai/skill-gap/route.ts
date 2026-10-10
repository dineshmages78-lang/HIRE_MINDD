import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { AgentOrchestrator } from "@/lib/ai/orchestration/agent-orchestrator";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, jobId } = await req.json();

    if (!studentId || !jobId) {
      return NextResponse.json(
        { error: "studentId and jobId are required." },
        { status: 400 }
      );
    }

    const report = await AgentOrchestrator.executeSkillGapAnalysis({
      studentId,
      jobId,
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("Skill gap error:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze skill gaps" }, { status: 500 });
  }
}
