import { aiClient } from "../ai-client";
import { JD_ANALYSIS_SYSTEM_PROMPT } from "../prompts/jd-prompts";
import { JDAnalysis, JDAnalysisSchema } from "../schemas/ai-schemas";
import { getMongoCollection, COLLECTIONS } from "@/lib/db/mongodb";
import { addDocument, CHROMA_COLLECTIONS } from "../retrieval/chroma-service";
import { prisma } from "@/lib/db/prisma";

export interface JDAnalysisInput {
  jobId: string;
  companyName: string;
  rawText: string;
}

export async function runJDAnalysisAgent(input: JDAnalysisInput): Promise<JDAnalysis> {
  const prompt = `
Please analyze the following Job Description for company "${input.companyName}":

${input.rawText}

Extract structured job title, technical skills (required vs preferred), soft skills, education eligibility, experience requirements, responsibilities, and domain keywords.
`;

  // 1. Generate structured JD Analysis via AI Client
  const analysis: JDAnalysis = await aiClient.generateStructuredOutput(
    prompt,
    JDAnalysisSchema,
    { systemPrompt: JD_ANALYSIS_SYSTEM_PROMPT, temperature: 0.1 }
  );

  // 2. Update PostgreSQL job record minCgpa if extracted
  try {
    if (analysis.education.minimumCGPA) {
      await prisma.job.update({
        where: { id: input.jobId },
        data: {
          minCgpa: analysis.education.minimumCGPA,
        },
      });
    }
  } catch (e) {
    // Non-fatal if job not yet in postgres or already up to date
  }

  // 3. Store flexible unstructured document in MongoDB referencing PostgreSQL jobId
  const mongoCollection = await getMongoCollection(COLLECTIONS.JOB_DESCRIPTIONS);
  await mongoCollection.updateOne(
    { jobId: input.jobId },
    {
      $set: {
        jobId: input.jobId,
        title: analysis.jobTitle,
        company: {
          name: input.companyName,
        },
        rawText: input.rawText,
        requirements: {
          technicalSkills: analysis.requirements.technicalSkills,
          preferredSkills: analysis.requirements.preferredSkills,
          softSkills: analysis.requirements.softSkills,
        },
        education: analysis.education,
        experience: analysis.experience,
        responsibilities: analysis.responsibilities,
        aiAnalysis: {
          summary: analysis.summary,
          difficultyLevel: analysis.difficultyLevel,
          importantKeywords: analysis.importantKeywords,
        },
        updatedAt: new Date().toISOString(),
      },
    }
  );

  // 4. Index semantic document chunk into ChromaDB
  const embeddingText = `
Job Title: ${analysis.jobTitle} at ${input.companyName}.
Required Skills: ${analysis.requirements.technicalSkills.join(", ")}.
Preferred Skills: ${analysis.requirements.preferredSkills.join(", ")}.
Soft Skills: ${analysis.requirements.softSkills.join(", ")}.
Responsibilities: ${analysis.responsibilities.slice(0, 3).join("; ")}.
Keywords: ${analysis.importantKeywords.join(", ")}.
Summary: ${analysis.summary}
`;

  await addDocument(CHROMA_COLLECTIONS.JOB_EMBEDDINGS, {
    id: `job-${input.jobId}`,
    document: embeddingText,
    metadata: {
      jobId: input.jobId,
      companyName: input.companyName,
      title: analysis.jobTitle,
      skills: analysis.requirements.technicalSkills.join(","),
    },
  });

  return analysis;
}
