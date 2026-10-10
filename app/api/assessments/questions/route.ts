import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { DifficultyLevel } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessmentId");
    const difficulty = searchParams.get("difficulty");
    const skill = searchParams.get("skill");

    if (!assessmentId) {
      return NextResponse.json({ error: "assessmentId is required" }, { status: 400 });
    }

    const where: any = { assessmentId };
    if (difficulty) {
      where.difficulty = difficulty as DifficultyLevel;
    }
    if (skill) {
      where.skill = { contains: skill, mode: "insensitive" };
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    const parsedQuestions = questions.map((q) => {
      let optionsList: string[] = [];
      try {
        optionsList = JSON.parse(q.options);
      } catch {
        optionsList = [q.options];
      }
      return {
        ...q,
        options: optionsList,
        isProgramming: q.text.includes("```") || q.text.toLowerCase().includes("def ") || q.text.toLowerCase().includes("function") || q.text.toLowerCase().includes("select "),
      };
    });

    return NextResponse.json({
      success: true,
      totalCount: questions.length,
      questions: parsedQuestions,
    });
  } catch (err: any) {
    console.error("Fetch questions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("RECRUITER"))) {
      return NextResponse.json({ error: "Unauthorized. Admin or Recruiter role required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      assessmentId,
      text,
      codeSnippet,
      codeLanguage,
      options,
      correctOption,
      difficulty,
      skill,
      topic,
    } = body;

    if (!assessmentId || !text || !options || correctOption === undefined) {
      return NextResponse.json(
        { error: "assessmentId, text, options (array of 4), and correctOption are required." },
        { status: 400 }
      );
    }

    // Combine codeSnippet into text if provided separately
    let formattedText = text;
    if (codeSnippet && codeSnippet.trim()) {
      const lang = (codeLanguage || "").trim();
      formattedText = `${text.trim()}\n\n\`\`\`${lang}\n${codeSnippet.trim()}\n\`\`\``;
    }

    const optionsJson = Array.isArray(options) ? JSON.stringify(options) : options;

    const question = await prisma.question.create({
      data: {
        assessmentId,
        text: formattedText,
        options: optionsJson,
        correctOption: Number(correctOption),
        difficulty: (difficulty as DifficultyLevel) || DifficultyLevel.MEDIUM,
        skill: skill || "General Engineering",
        topic: topic || "Technical Assessment",
        status: "APPROVED",
      },
    });

    // Also update totalQuestions in assessment
    const questionCount = await prisma.question.count({
      where: { assessmentId, status: "APPROVED" },
    });
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { totalQuestions: questionCount },
    });

    return NextResponse.json({
      success: true,
      question,
      totalQuestions: questionCount,
    });
  } catch (err: any) {
    console.error("Add question error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("RECRUITER"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("id");

    if (!questionId) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    const question = await prisma.question.delete({
      where: { id: questionId },
    });

    // Update count in assessment
    const remainingCount = await prisma.question.count({
      where: { assessmentId: question.assessmentId, status: "APPROVED" },
    });
    await prisma.assessment.update({
      where: { id: question.assessmentId },
      data: { totalQuestions: remainingCount },
    });

    return NextResponse.json({ success: true, remainingCount });
  } catch (err: any) {
    console.error("Delete question error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
