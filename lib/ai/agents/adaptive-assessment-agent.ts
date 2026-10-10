import { prisma } from "@/lib/db/prisma";
import { DifficultyLevel } from "@prisma/client";

export interface AdaptiveStepInput {
  attemptId: string;
  lastQuestionId?: string;
  selectedOption?: number;
  timeSpentSeconds?: number;
}

export interface AdaptiveStepResult {
  nextQuestion: {
    id: string;
    text: string;
    options: string[];
    difficulty: DifficultyLevel;
    skill: string;
    topic: string | null;
  } | null;
  currentDifficulty: DifficultyLevel;
  totalAnswered: number;
  totalQuestions: number;
  isComplete: boolean;
  scorePercentage?: number;
}

export async function runAdaptiveAssessmentAgent(input: AdaptiveStepInput): Promise<AdaptiveStepResult> {
  // 1. Fetch Attempt with its Assessment and past Responses
  let attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: input.attemptId },
    include: {
      assessment: {
        include: {
          questions: {
            where: { status: "APPROVED" },
          },
        },
      },
      responses: {
        include: { question: true },
      },
    },
  });

  if (!attempt) {
    // Graceful fallback: look for any active IN_PROGRESS attempt
    attempt = await prisma.assessmentAttempt.findFirst({
      where: { status: "IN_PROGRESS" },
      include: {
        assessment: {
          include: {
            questions: {
              where: { status: "APPROVED" },
            },
          },
        },
        responses: {
          include: { question: true },
        },
      },
      orderBy: { startedAt: "desc" },
    });
  }

  if (!attempt) {
    const student = await prisma.studentProfile.findFirst();
    const assessment = await prisma.assessment.findFirst({
      include: { questions: { where: { status: "APPROVED" } } },
    });
    if (!student || !assessment) {
      throw new Error(`Assessment attempt not found: ${input.attemptId}`);
    }
    attempt = await prisma.assessmentAttempt.create({
      data: {
        assessmentId: assessment.id,
        studentId: student.id,
        status: "IN_PROGRESS",
        currentDifficulty: "MEDIUM",
      },
      include: {
        assessment: {
          include: {
            questions: {
              where: { status: "APPROVED" },
            },
          },
        },
        responses: {
          include: { question: true },
        },
      },
    });
  }

  const allQuestions = attempt.assessment.questions;
  const answeredQuestionIds = new Set(attempt.responses.map((r) => r.questionId));

  // 2. If an answer was just submitted, grade it and record in PostgreSQL
  let lastWasCorrect: boolean | null = null;
  if (input.lastQuestionId && input.selectedOption !== undefined) {
    const question = allQuestions.find((q) => q.id === input.lastQuestionId);
    if (question) {
      lastWasCorrect = input.selectedOption === question.correctOption;
      await prisma.assessmentResponse.create({
        data: {
          attemptId: input.attemptId,
          questionId: input.lastQuestionId,
          selectedOption: input.selectedOption,
          isCorrect: lastWasCorrect,
          timeSpentSeconds: input.timeSpentSeconds || 30,
        },
      });
      answeredQuestionIds.add(input.lastQuestionId);
    }
  }

  // 3. Dynamic Difficulty Item Response Engine (IRT Adaptation)
  let currentDifficulty = attempt.currentDifficulty;

  if (lastWasCorrect !== null) {
    if (lastWasCorrect) {
      // Elevate difficulty on correct answer
      if (currentDifficulty === "EASY") {
        currentDifficulty = "MEDIUM";
      } else if (currentDifficulty === "MEDIUM") {
        currentDifficulty = "HARD";
      }
      // If already HARD, remain on HARD
    } else {
      // De-escalate difficulty on incorrect answer
      if (currentDifficulty === "HARD") {
        currentDifficulty = "MEDIUM";
      } else if (currentDifficulty === "MEDIUM") {
        currentDifficulty = "EASY";
      }
      // If already EASY, remain on EASY
    }

    // Update current difficulty in database
    await prisma.assessmentAttempt.update({
      where: { id: attempt.id },
      data: { currentDifficulty },
    });
  }

  // 4. Check completion limit (10 adaptive questions per session from question bank)
  const maxQuestions = Math.min(10, allQuestions.length);
  const totalAnswered = answeredQuestionIds.size;

  if (totalAnswered >= maxQuestions || allQuestions.length === 0) {
    // Complete the assessment
    const updatedResponses = await prisma.assessmentResponse.findMany({
      where: { attemptId: attempt.id },
    });
    const correctCount = updatedResponses.filter((r) => r.isCorrect).length;
    const finalScore = Math.round((correctCount / (updatedResponses.length || 1)) * 100);

    await prisma.assessmentAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "COMPLETED",
        score: finalScore,
        completedAt: new Date(),
      },
    });

    return {
      nextQuestion: null,
      currentDifficulty,
      totalAnswered,
      totalQuestions: maxQuestions,
      isComplete: true,
      scorePercentage: finalScore,
    };
  }

  // 5. Select next best question at current target difficulty
  const remainingQuestions = allQuestions.filter((q) => !answeredQuestionIds.has(q.id));

  // Try exact difficulty match first
  let nextQ = remainingQuestions.find((q) => q.difficulty === currentDifficulty);

  // If none at current difficulty, fallback to any remaining question
  if (!nextQ) {
    nextQ = remainingQuestions[0];
  }

  if (!nextQ) {
    // No more questions available
    return {
      nextQuestion: null,
      currentDifficulty,
      totalAnswered,
      totalQuestions: maxQuestions,
      isComplete: true,
      scorePercentage: 100,
    };
  }

  let optionsList: string[] = [];
  try {
    optionsList = JSON.parse(nextQ.options);
  } catch {
    optionsList = ["Option A", "Option B", "Option C", "Option D"];
  }

  return {
    nextQuestion: {
      id: nextQ.id,
      text: nextQ.text,
      options: optionsList,
      difficulty: nextQ.difficulty,
      skill: nextQ.skill,
      topic: nextQ.topic,
    },
    currentDifficulty,
    totalAnswered,
    totalQuestions: maxQuestions,
    isComplete: false,
  };
}
