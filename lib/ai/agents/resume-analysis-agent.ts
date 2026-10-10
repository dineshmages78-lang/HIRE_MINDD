import { aiClient } from "../ai-client";
import { RESUME_ANALYSIS_SYSTEM_PROMPT } from "../prompts/resume-prompts";
import { ResumeAnalysis, ResumeAnalysisSchema } from "../schemas/ai-schemas";
import { getMongoCollection, COLLECTIONS } from "@/lib/db/mongodb";
import { addDocument, CHROMA_COLLECTIONS } from "../retrieval/chroma-service";
import { prisma } from "@/lib/db/prisma";

export interface ResumeAnalysisInput {
  resumeId: string;
  studentId: string;
  rawText: string;
  fileName: string;
}

export async function runResumeAnalysisAgent(input: ResumeAnalysisInput): Promise<ResumeAnalysis> {
  const prompt = `
Please analyze the following student resume text:

${input.rawText}

Extract structured skills, education, experience, projects, certifications, compute a quality score (0-100), and highlight strengths and improvement areas.
`;

  // 1. Generate structured analysis via AI Client
  const analysis: ResumeAnalysis = await aiClient.generateStructuredOutput(
    prompt,
    ResumeAnalysisSchema,
    { systemPrompt: RESUME_ANALYSIS_SYSTEM_PROMPT, temperature: 0.1 }
  );

  // 2. Persist metadata in PostgreSQL
  await prisma.resume.update({
    where: { id: input.resumeId },
    data: {
      status: "PARSED",
      qualityScore: analysis.resumeQualityScore,
    },
  });

  // 3. Persist flexible unstructured document in MongoDB
  const mongoCollection = await getMongoCollection(COLLECTIONS.RESUME_DOCUMENTS);
  await mongoCollection.updateOne(
    { resumeId: input.resumeId },
    {
      $set: {
        resumeId: input.resumeId,
        studentId: input.studentId,
        fileName: input.fileName,
        rawText: input.rawText,
        education: analysis.education,
        skills: {
          technical: analysis.technicalSkills,
          soft: analysis.softSkills,
        },
        experience: analysis.experience,
        projects: analysis.projects,
        certifications: analysis.certifications,
        aiAnalysis: {
          summary: analysis.summary,
          qualityScore: analysis.resumeQualityScore,
          strengths: analysis.keyStrengths,
          improvements: analysis.areasForImprovement,
        },
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );

  // 4. Index semantic document chunk into ChromaDB
  const embeddingText = `
Candidate Skills: ${analysis.technicalSkills.map((s) => s.name).join(", ")}.
Soft Skills: ${analysis.softSkills.join(", ")}.
Summary: ${analysis.summary}.
Projects: ${analysis.projects.map((p) => `${p.title} (${p.technologies.join(", ")})`).join("; ")}.
Certifications: ${analysis.certifications.join(", ")}.
`;

  await addDocument(CHROMA_COLLECTIONS.RESUME_EMBEDDINGS, {
    id: `resume-${input.resumeId}`,
    document: embeddingText,
    metadata: {
      resumeId: input.resumeId,
      studentId: input.studentId,
      qualityScore: analysis.resumeQualityScore,
      skills: analysis.technicalSkills.map((s) => s.name).join(","),
    },
  });

  return analysis;
}
