import { getMongoCollection, COLLECTIONS } from "@/lib/db/mongodb";
import { runResumeAnalysisAgent, ResumeAnalysisInput } from "../agents/resume-analysis-agent";
import { runJDAnalysisAgent, JDAnalysisInput } from "../agents/jd-analysis-agent";
import { runCandidateMatchingAgent, CandidateMatchingInput } from "../agents/matching-agent";
import { runAssessmentQuestionGenerationAgent, QuestionGenerationInput } from "../agents/assessment-generation-agent";
import { runAdaptiveAssessmentAgent, AdaptiveStepInput } from "../agents/adaptive-assessment-agent";
import { runAdaptiveInterviewAgent, InterviewMessageInput } from "../agents/interview-agent";
import { runInterviewEvaluationAgent, InterviewEvaluationInput } from "../agents/interview-evaluation-agent";
import { runSkillGapAgent, SkillGapInput } from "../agents/skill-gap-agent";

export interface AgentExecutionRecord {
  agent: string;
  entityId: string;
  status: "started" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  model: string;
  retrievalSources?: string[];
  inputSnapshot?: any;
  result?: any;
  error?: string | null;
}

export async function logAgentRun(record: AgentExecutionRecord): Promise<string> {
  const collection = await getMongoCollection(COLLECTIONS.AGENT_RUNS);
  const res = await collection.insertOne({
    ...record,
    createdAt: new Date().toISOString(),
  });
  return res.insertedId?.toString();
}

// ----------------------------------------
// ORCHESTRATED WORKFLOWS
// ----------------------------------------

export class AgentOrchestrator {
  static async executeResumeAnalysis(input: ResumeAnalysisInput) {
    const startedAt = new Date().toISOString();
    try {
      const result = await runResumeAnalysisAgent(input);
      await logAgentRun({
        agent: "resume-analysis-agent",
        entityId: input.resumeId,
        status: "completed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        retrievalSources: [input.fileName],
        inputSnapshot: { resumeId: input.resumeId, studentId: input.studentId },
        result: { qualityScore: result.resumeQualityScore, skillsCount: result.technicalSkills.length },
        error: null,
      });
      return result;
    } catch (err: any) {
      await logAgentRun({
        agent: "resume-analysis-agent",
        entityId: input.resumeId,
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        error: err.message,
      });
      throw err;
    }
  }

  static async executeJDAnalysis(input: JDAnalysisInput) {
    const startedAt = new Date().toISOString();
    try {
      const result = await runJDAnalysisAgent(input);
      await logAgentRun({
        agent: "jd-analysis-agent",
        entityId: input.jobId,
        status: "completed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        retrievalSources: [input.companyName],
        result: { title: result.jobTitle, skillsCount: result.requirements.technicalSkills.length },
        error: null,
      });
      return result;
    } catch (err: any) {
      await logAgentRun({
        agent: "jd-analysis-agent",
        entityId: input.jobId,
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        error: err.message,
      });
      throw err;
    }
  }

  static async executeCandidateMatch(input: CandidateMatchingInput) {
    const startedAt = new Date().toISOString();
    const entityId = input.applicationId || `${input.studentId}_${input.jobId}`;
    try {
      const result = await runCandidateMatchingAgent(input);
      await logAgentRun({
        agent: "candidate-matching-agent",
        entityId,
        status: "completed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        retrievalSources: [`student-${input.studentId}`, `job-${input.jobId}`],
        result: {
          overallMatch: result.overallMatchScore,
          recommendation: result.recommendation,
          factors: result.factors,
        },
        error: null,
      });
      return result;
    } catch (err: any) {
      await logAgentRun({
        agent: "candidate-matching-agent",
        entityId,
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        error: err.message,
      });
      throw err;
    }
  }

  static async executeQuestionGeneration(input: QuestionGenerationInput) {
    const startedAt = new Date().toISOString();
    try {
      const result = await runAssessmentQuestionGenerationAgent(input);
      await logAgentRun({
        agent: "assessment-generation-agent",
        entityId: input.assessmentId,
        status: "completed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        result: { generatedQuestionsCount: result.length },
        error: null,
      });
      return result;
    } catch (err: any) {
      await logAgentRun({
        agent: "assessment-generation-agent",
        entityId: input.assessmentId,
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        error: err.message,
      });
      throw err;
    }
  }

  static async executeAdaptiveStep(input: AdaptiveStepInput) {
    return runAdaptiveAssessmentAgent(input);
  }

  static async executeInterviewTurn(input: InterviewMessageInput) {
    return runAdaptiveInterviewAgent(input);
  }

  static async executeInterviewEvaluation(input: InterviewEvaluationInput) {
    const startedAt = new Date().toISOString();
    try {
      const result = await runInterviewEvaluationAgent(input);
      await logAgentRun({
        agent: "interview-evaluation-agent",
        entityId: input.sessionId,
        status: "completed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        result: { overallScore: result.overallScore, decision: result.decision },
        error: null,
      });
      return result;
    } catch (err: any) {
      await logAgentRun({
        agent: "interview-evaluation-agent",
        entityId: input.sessionId,
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        error: err.message,
      });
      throw err;
    }
  }

  static async executeSkillGapAnalysis(input: SkillGapInput) {
    const startedAt = new Date().toISOString();
    try {
      const result = await runSkillGapAgent(input);
      await logAgentRun({
        agent: "skill-gap-agent",
        entityId: `${input.studentId}_${input.jobId}`,
        status: "completed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        result: { readinessScore: result.overallReadinessScore, gapsCount: result.gaps.length },
        error: null,
      });
      return result;
    } catch (err: any) {
      await logAgentRun({
        agent: "skill-gap-agent",
        entityId: `${input.studentId}_${input.jobId}`,
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        model: process.env.AI_PROVIDER || "gemini-1.5-flash",
        error: err.message,
      });
      throw err;
    }
  }
}
