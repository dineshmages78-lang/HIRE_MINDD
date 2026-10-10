import { aiClient } from "../ai-client";
import { SKILL_GAP_SYSTEM_PROMPT } from "../prompts/skill-gap-prompts";
import { SkillGapReport, SkillGapReportSchema } from "../schemas/ai-schemas";
import { getMongoCollection, COLLECTIONS } from "@/lib/db/mongodb";
import { addDocument, CHROMA_COLLECTIONS } from "../retrieval/chroma-service";
import { prisma } from "@/lib/db/prisma";

export interface SkillGapInput {
  studentId: string;
  jobId: string;
}

export async function runSkillGapAgent(input: SkillGapInput): Promise<SkillGapReport> {
  // 1. Fetch Student Profile, Latest Resume, and Attempts
  const student = await prisma.studentProfile.findUnique({
    where: { id: input.studentId },
    include: {
      user: true,
      resumes: { orderBy: { uploadedAt: "desc" }, take: 1 },
      assessmentAttempts: {
        where: { assessment: { jobId: input.jobId } },
        include: { responses: { include: { question: true } } },
      },
      interviews: {
        where: { application: { jobId: input.jobId } },
        include: { evaluation: true },
      },
    },
  });

  if (!student) {
    throw new Error(`Student not found: ${input.studentId}`);
  }

  // 2. Fetch Job Description from MongoDB
  const mongoJdDocs = await getMongoCollection(COLLECTIONS.JOB_DESCRIPTIONS);
  const jdDoc = await mongoJdDocs.findOne({ jobId: input.jobId });
  const requiredSkills: string[] = jdDoc?.requirements?.technicalSkills || ["Python", "SQL", "React", "Docker"];

  // 3. Fetch Resume Document from MongoDB
  const latestResume = student.resumes[0];
  const mongoResumeDocs = await getMongoCollection(COLLECTIONS.RESUME_DOCUMENTS);
  const resumeDoc = latestResume ? await mongoResumeDocs.findOne({ resumeId: latestResume.id }) : null;
  const candidateSkills = resumeDoc?.skills?.technical?.map((s: any) => `${s.name} (${s.proficiency})`) || [];

  // Assessment performance breakdown
  const attempt = student.assessmentAttempts[0];
  const assessmentScore = attempt?.score ?? "Not taken";

  // Interview evaluation
  const interviewEval = student.interviews[0]?.evaluation;
  const interviewSummary = interviewEval
    ? `Overall: ${interviewEval.overallScore}, Tech: ${interviewEval.technicalScore}, Decision: ${interviewEval.decision}`
    : "No interview conducted yet";

  // 4. Formulate Prompt
  const prompt = `
Analyze skill gaps for candidate "${student.user.firstName} ${student.user.lastName}" against job "${jdDoc?.title || "Software Engineer"}".

TARGET JOB REQUIRED SKILLS:
${requiredSkills.join(", ")}

CANDIDATE RESUME DEMONSTRATED SKILLS:
${candidateSkills.join(", ")}

ASSESSMENT SCORE:
${assessmentScore}%

INTERVIEW PERFORMANCE:
${interviewSummary}

For each required skill, determine:
- Required Level (Beginner, Intermediate, Advanced, Expert)
- Current Demonstrated Level (None, Beginner, Intermediate, Advanced)
- Gap Severity (None, Low, Medium, High, Critical)
- Priority (Critical, High, Medium, Low)
- Recommended Actions

Formulate an overall placement readiness score (0-100), concise summary, and a 2-phase learning roadmap.
`;

  // 5. Generate Structured Report via AI Client
  const report: SkillGapReport = await aiClient.generateStructuredOutput(
    prompt,
    SkillGapReportSchema,
    { systemPrompt: SKILL_GAP_SYSTEM_PROMPT, temperature: 0.1 }
  );

  // 6. Store Detailed Analysis in MongoDB
  const mongoSkillAnalysis = await getMongoCollection(COLLECTIONS.SKILL_ANALYSIS);
  await mongoSkillAnalysis.updateOne(
    { studentId: input.studentId, jobId: input.jobId },
    {
      $set: {
        studentId: input.studentId,
        jobId: input.jobId,
        readinessScore: report.overallReadinessScore,
        summary: report.summary,
        gaps: report.gaps,
        learningRoadmap: report.learningRoadmap,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  // 7. Store Searchable Skill Embeddings in ChromaDB
  for (const gap of report.gaps) {
    await addDocument(CHROMA_COLLECTIONS.SKILL_EMBEDDINGS, {
      id: `skill-gap-${input.studentId}-${gap.skill.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      document: `Skill: ${gap.skill}. Required: ${gap.requiredLevel}. Current: ${gap.currentLevel}. Gap: ${gap.gapSeverity}. Priority: ${gap.priority}. Recommendations: ${gap.recommendedActions.join("; ")}`,
      metadata: {
        studentId: input.studentId,
        jobId: input.jobId,
        skill: gap.skill,
        gapSeverity: gap.gapSeverity,
        priority: gap.priority,
      },
    });
  }

  return report;
}
