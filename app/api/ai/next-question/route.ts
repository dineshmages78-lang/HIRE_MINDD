import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { AgentOrchestrator } from "@/lib/ai/orchestration/agent-orchestrator";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId, lastQuestionId, selectedOption, timeSpentSeconds } = await req.json();

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId is required." }, { status: 400 });
    }

    const stepResult = await AgentOrchestrator.executeAdaptiveStep({
      attemptId,
      lastQuestionId,
      selectedOption,
      timeSpentSeconds,
    });

    return NextResponse.json({
      success: true,
      ...stepResult,
    });
  } catch (err: any) {
    console.error("Adaptive step error:", err);
    return NextResponse.json({ error: err.message || "Failed to process assessment step" }, { status: 500 });
  }
}
