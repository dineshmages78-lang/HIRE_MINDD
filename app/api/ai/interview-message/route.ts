import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { AgentOrchestrator } from "@/lib/ai/orchestration/agent-orchestrator";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, candidateMessage, isInitial } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }

    const result = await AgentOrchestrator.executeInterviewTurn({
      sessionId,
      candidateMessage,
      isInitial: !!isInitial,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("Interview turn error:", err);
    return NextResponse.json({ error: err.message || "Failed to process interview turn" }, { status: 500 });
  }
}
