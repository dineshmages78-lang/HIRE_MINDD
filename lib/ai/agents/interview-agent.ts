import { aiClient } from "../ai-client";
import { INTERVIEW_AGENT_SYSTEM_PROMPT } from "../prompts/interview-prompts";
import { getMongoCollection, COLLECTIONS } from "@/lib/db/mongodb";
import { addDocument, querySimilarDocuments, CHROMA_COLLECTIONS } from "../retrieval/chroma-service";
import { prisma } from "@/lib/db/prisma";

export interface InterviewMessageInput {
  sessionId: string;
  candidateMessage?: string;
  isInitial?: boolean;
}

export interface InterviewMessageOutput {
  interviewerMessage: string;
  turnNumber: number;
  topic: string;
  isCompleted: boolean;
}

export async function runAdaptiveInterviewAgent(
  input: InterviewMessageInput
): Promise<InterviewMessageOutput> {
  // 1. Fetch Interview Session from PostgreSQL
  const session = await prisma.interviewSession.findUnique({
    where: { id: input.sessionId },
    include: {
      application: {
        include: {
          job: { include: { company: true } },
          student: { include: { user: true } },
        },
      },
    },
  });

  if (!session) {
    throw new Error(`Interview session not found: ${input.sessionId}`);
  }

  const job = session.application.job;
  const student = session.application.student;

  // 2. Fetch existing transcript from MongoDB
  const mongoTranscripts = await getMongoCollection(COLLECTIONS.INTERVIEW_TRANSCRIPTS);
  let transcriptDoc = await mongoTranscripts.findOne({ sessionId: input.sessionId });

  if (!transcriptDoc) {
    transcriptDoc = {
      sessionId: input.sessionId,
      messages: [],
      createdAt: new Date().toISOString(),
    };
  }

  const messages: Array<{ role: "assistant" | "user"; content: string; timestamp: string }> =
    transcriptDoc.messages || [];

  // 3. If candidate sent a response, record it and index into ChromaDB
  if (input.candidateMessage) {
    messages.push({
      role: "user",
      content: input.candidateMessage,
      timestamp: new Date().toISOString(),
    });

    // Vector index response for context retrieval
    await addDocument(CHROMA_COLLECTIONS.INTERVIEW_EMBEDDINGS, {
      id: `session-${input.sessionId}-turn-${messages.length}`,
      document: `Candidate (${student.user.firstName}): ${input.candidateMessage}`,
      metadata: {
        sessionId: input.sessionId,
        role: "user",
        turn: messages.length,
      },
    });
  }

  // 4. Check if interview should conclude (e.g. after 5 candidate exchanges)
  const candidateTurns = messages.filter((m) => m.role === "user").length;
  if (candidateTurns >= 4) {
    const closingMessage = `Thank you, ${student.user.firstName}! That concludes our technical interview session for the ${job.title} position at ${job.company.name}. Our evaluation agent will now synthesize your responses across technical depth, problem-solving, and communication clarity to generate your comprehensive placement review. Best of luck!`;

    messages.push({
      role: "assistant",
      content: closingMessage,
      timestamp: new Date().toISOString(),
    });

    await mongoTranscripts.updateOne(
      { sessionId: input.sessionId },
      { $set: { messages, updatedAt: new Date().toISOString(), isCompleted: true } }
    );

    await prisma.interviewSession.update({
      where: { id: input.sessionId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    return {
      interviewerMessage: closingMessage,
      turnNumber: messages.length,
      topic: "Conclusion",
      isCompleted: true,
    };
  }

  // 5. Query ChromaDB for related interview context or questions
  const contextQuery = input.candidateMessage || `${job.title} technical interview core concepts`;
  const similarContext = await querySimilarDocuments(
    CHROMA_COLLECTIONS.INTERVIEW_EMBEDDINGS,
    contextQuery,
    2
  );
  const contextSnippet = similarContext.map((c) => c.document).join("\n");

  // 6. Generate next question or intelligent adaptive follow-up
  let interviewerResponse = "";
  if (input.isInitial || messages.length === 0) {
    interviewerResponse = `Hello ${student.user.firstName}! Welcome to your technical interview for the ${job.title} role at ${job.company.name}. To kick off, could you briefly introduce yourself, highlight the core technical stack you've worked with, and share an engineering challenge you solved in one of your recent projects?`;
  } else {
    const prompt = `
You are conducting a technical interview for: ${job.title} at ${job.company.name}.
Target skills: Python, React, PostgreSQL, Node.js, Problem Solving.

CONVERSATION TRANSCRIPT SO FAR:
${messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

CANDIDATE'S LAST RESPONSE:
"${input.candidateMessage}"

RETRIEVED CONTEXT:
${contextSnippet}

Generate an incisive, realistic, and adaptive technical follow-up or next technical question. If the candidate mentioned a specific technology or architectural decision, probe deeper into constraints, trade-offs, edge cases, or optimization. Keep it concise (2-4 sentences). Do not repeat past questions.
`;

    try {
      interviewerResponse = await aiClient.generateText(prompt, {
        systemPrompt: INTERVIEW_AGENT_SYSTEM_PROMPT,
        temperature: 0.3,
      });
    } catch {
      interviewerResponse = `That is very interesting. Building upon that, how did you ensure data consistency and handle high concurrent requests in your implementation? What trade-offs did you consider?`;
    }
  }

  messages.push({
    role: "assistant",
    content: interviewerResponse,
    timestamp: new Date().toISOString(),
  });

  // 7. Update MongoDB transcript document
  await mongoTranscripts.updateOne(
    { sessionId: input.sessionId },
    { $set: { messages, updatedAt: new Date().toISOString() } }
  );

  // Update session status to IN_PROGRESS if still SCHEDULED
  if (session.status === "SCHEDULED") {
    await prisma.interviewSession.update({
      where: { id: input.sessionId },
      data: { status: "IN_PROGRESS" },
    });
  }

  return {
    interviewerMessage: interviewerResponse,
    turnNumber: messages.length,
    topic: "Technical Assessment",
    isCompleted: false,
  };
}
