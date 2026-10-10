import { aiClient } from "../ai-client";
import { INTERVIEW_EVALUATION_SYSTEM_PROMPT } from "../prompts/interview-prompts";
import { InterviewEvaluation, InterviewEvaluationSchema } from "../schemas/ai-schemas";
import { getMongoCollection, COLLECTIONS } from "@/lib/db/mongodb";
import { prisma } from "@/lib/db/prisma";

export interface InterviewEvaluationInput {
  sessionId: string;
}

export async function runInterviewEvaluationAgent(
  input: InterviewEvaluationInput
): Promise<InterviewEvaluation> {
  // 1. Fetch Session and Transcript
  const session = await prisma.interviewSession.findUnique({
    where: { id: input.sessionId },
    include: {
      application: {
        include: {
          job: { include: { company: true } },
          student: { include: { user: true } },
        },
      },
      evaluation: true,
    },
  });

  if (!session) {
    throw new Error(`Session not found: ${input.sessionId}`);
  }

  const mongoTranscripts = await getMongoCollection(COLLECTIONS.INTERVIEW_TRANSCRIPTS);
  const transcriptDoc = await mongoTranscripts.findOne({ sessionId: input.sessionId });
  const messages: Array<{ role: string; content: string }> = transcriptDoc?.messages || [];

  const job = session.application.job;
  const student = session.application.student;

  // 2. Build Evaluation Prompt
  const prompt = `
Evaluate the following complete interview transcript for candidate "${student.user.firstName} ${student.user.lastName}" applying for "${job.title}" at "${job.company.name}".

TRANSCRIPT:
${messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}

Evaluate across:
1. Technical Knowledge (0-100)
2. Problem Solving (0-100)
3. Communication & Clarity (0-100)
4. Role Relevance (0-100)
Compute overall score (0-100), decision (HIRE, CONSIDER, REJECT), top strengths, weak areas, and detailed feedback.
`;

  // 3. Generate Structured Evaluation via AI Client
  const evaluation: InterviewEvaluation = await aiClient.generateStructuredOutput(
    prompt,
    InterviewEvaluationSchema,
    { systemPrompt: INTERVIEW_EVALUATION_SYSTEM_PROMPT, temperature: 0.1 }
  );

  // 4. Store in PostgreSQL InterviewEvaluation
  await prisma.interviewEvaluation.upsert({
    where: { sessionId: input.sessionId },
    create: {
      sessionId: input.sessionId,
      overallScore: evaluation.overallScore,
      technicalScore: evaluation.technicalScore,
      problemSolvingScore: evaluation.problemSolvingScore,
      communicationScore: evaluation.communicationScore,
      roleRelevanceScore: evaluation.roleRelevanceScore,
      decision: evaluation.decision as any,
    },
    update: {
      overallScore: evaluation.overallScore,
      technicalScore: evaluation.technicalScore,
      problemSolvingScore: evaluation.problemSolvingScore,
      communicationScore: evaluation.communicationScore,
      roleRelevanceScore: evaluation.roleRelevanceScore,
      decision: evaluation.decision as any,
    },
  });

  // 5. Store Detailed Analysis in MongoDB
  const mongoAnalysis = await getMongoCollection(COLLECTIONS.AI_ANALYSIS_DOCUMENTS);
  await mongoAnalysis.insertOne({
    type: "interview_evaluation",
    sessionId: input.sessionId,
    applicationId: session.applicationId,
    studentId: session.studentId,
    evaluation,
    evaluatedAt: new Date().toISOString(),
  });

  // 6. Update Application status
  if (evaluation.decision === "HIRE") {
    await prisma.application.update({
      where: { id: session.applicationId },
      data: { status: "OFFERED" },
    });
  } else if (session.application.status === "INTERVIEW_SCHEDULED") {
    await prisma.application.update({
      where: { id: session.applicationId },
      data: { status: "INTERVIEW_COMPLETED" },
    });
  }

  return evaluation;
}
