import { aiClient } from "../ai-client";
import { CANDIDATE_MATCHING_SYSTEM_PROMPT } from "../prompts/matching-prompts";
import { CandidateMatchResult, CandidateMatchResultSchema } from "../schemas/ai-schemas";
import { getMongoCollection, COLLECTIONS } from "@/lib/db/mongodb";
import { querySimilarDocuments, CHROMA_COLLECTIONS } from "../retrieval/chroma-service";
import { prisma } from "@/lib/db/prisma";

export interface CandidateMatchingInput {
  studentId: string;
  jobId: string;
  applicationId?: string;
}

export async function runCandidateMatchingAgent(input: CandidateMatchingInput): Promise<CandidateMatchResult> {
  // 1. Fetch Student Relational & Document Data
  const student = await prisma.studentProfile.findUnique({
    where: { id: input.studentId },
    include: {
      user: true,
      resumes: { orderBy: { uploadedAt: "desc" }, take: 1 },
    },
  });

  if (!student) {
    throw new Error(`Student profile not found: ${input.studentId}`);
  }

  const latestResume = student.resumes[0];
  const mongoResumeDocs = await getMongoCollection(COLLECTIONS.RESUME_DOCUMENTS);
  const resumeDoc = latestResume
    ? await mongoResumeDocs.findOne({ resumeId: latestResume.id })
    : null;

  // 2. Fetch Job Relational & Document Data
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: { company: true },
  });

  if (!job) {
    throw new Error(`Job not found: ${input.jobId}`);
  }

  const mongoJdDocs = await getMongoCollection(COLLECTIONS.JOB_DESCRIPTIONS);
  const jdDoc = await mongoJdDocs.findOne({ jobId: input.jobId });

  // 3. Perform ChromaDB Semantic Retrieval
  // Query JD vectors using the candidate's resume embedding text
  const resumeQueryText = resumeDoc
    ? `${resumeDoc.skills?.technical?.map((s: any) => s.name).join(" ") || ""} ${resumeDoc.aiAnalysis?.summary || ""}`
    : `${student.department} ${student.degree} graduate with CGPA ${student.cgpa}`;

  const similarJds = await querySimilarDocuments(
    CHROMA_COLLECTIONS.JOB_EMBEDDINGS,
    resumeQueryText,
    3,
    { jobId: input.jobId }
  );

  const semanticScore = similarJds.length > 0 ? Math.round(similarJds[0].similarity * 100) : 75;

  // 4. Structured Skill Overlap Calculation
  const studentSkills: string[] = resumeDoc?.skills?.technical?.map((s: any) => s.name) || [
    "Python", "SQL", "Problem Solving"
  ];
  const requiredSkills: string[] = jdDoc?.requirements?.technicalSkills || ["Python", "SQL", "Git"];
  const preferredSkills: string[] = jdDoc?.requirements?.preferredSkills || [];

  const studentSkillsLower = studentSkills.map((s) => s.toLowerCase().trim());
  const matchedSkills = requiredSkills.filter((req) =>
    studentSkillsLower.some((ss) => ss.includes(req.toLowerCase()) || req.toLowerCase().includes(ss))
  );
  const missingSkills = requiredSkills.filter((req) => !matchedSkills.includes(req));

  const skillScore = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 80;

  // 5. Academic Eligibility Check
  const minCgpa = job.minCgpa || 6.0;
  const isCgpaEligible = student.cgpa >= minCgpa;
  const eligibilityScore = isCgpaEligible ? 100 : Math.max(20, Math.round((student.cgpa / minCgpa) * 80));

  // 6. Experience Alignment
  const experienceScore = 80; // Baseline for university placement candidate

  // 7. Configurable Hybrid Score Weighting (Section 15)
  // Semantic (30%), Skill Overlap (40%), Eligibility (20%), Experience (10%)
  const hybridOverall = Math.round(
    0.3 * semanticScore +
    0.4 * skillScore +
    0.2 * eligibilityScore +
    0.1 * experienceScore
  );

  // 8. Generate Explainable Evaluation via AI
  const prompt = `
Evaluate candidate fit for Job: "${job.title}" at "${job.company.name}".

CANDIDATE:
- Degree: ${student.degree}, Department: ${student.department}, CGPA: ${student.cgpa}
- Demonstrated Skills: ${studentSkills.join(", ")}
- Resume Summary: ${resumeDoc?.aiAnalysis?.summary || "Engineering student"}

JOB REQUIREMENTS:
- Minimum CGPA: ${minCgpa}
- Required Skills: ${requiredSkills.join(", ")}
- Preferred Skills: ${preferredSkills.join(", ")}

HYBRID METRICS CALCULATED:
- Semantic Vector Similarity: ${semanticScore}%
- Structured Skill Overlap: ${skillScore}% (Matched: ${matchedSkills.join(", ")}; Missing: ${missingSkills.join(", ")})
- Academic Eligibility Score: ${eligibilityScore}% (Eligible: ${isCgpaEligible})
- Experience Score: ${experienceScore}%
- Combined Hybrid Score: ${hybridOverall}%

Provide an explainable match evaluation with recommendation (Strong Match, Potential Match, Low Match, Not Eligible), evidence breakdown, strengths, and concerns.
`;

  const matchResult: CandidateMatchResult = await aiClient.generateStructuredOutput(
    prompt,
    CandidateMatchResultSchema,
    { systemPrompt: CANDIDATE_MATCHING_SYSTEM_PROMPT, temperature: 0.1 }
  );

  // Ensure overall score reflects the calculated hybrid score accurately
  matchResult.overallMatchScore = hybridOverall;
  matchResult.factors = {
    semanticScore,
    skillScore,
    eligibilityScore,
    experienceScore,
  };
  matchResult.matchedSkills = matchedSkills;
  matchResult.missingSkills = missingSkills;
  matchResult.academicEligibility = {
    isEligible: isCgpaEligible,
    studentCGPA: student.cgpa,
    requiredCGPA: minCgpa,
    degreeMatch: true,
  };

  // 9. Store Detailed Analysis in MongoDB
  const mongoAnalysis = await getMongoCollection(COLLECTIONS.AI_ANALYSIS_DOCUMENTS);
  await mongoAnalysis.insertOne({
    type: "candidate_match",
    studentId: input.studentId,
    jobId: input.jobId,
    applicationId: input.applicationId,
    overallScore: hybridOverall,
    factors: matchResult.factors,
    recommendation: matchResult.recommendation,
    matchedSkills,
    missingSkills,
    evidenceAndExplanation: matchResult.evidenceAndExplanation,
    strengths: matchResult.strengths,
    concerns: matchResult.concerns,
    createdAt: new Date().toISOString(),
  });

  // 10. Update PostgreSQL Application Record if Application ID was provided
  if (input.applicationId) {
    const isRecommended = hybridOverall >= 75 && isCgpaEligible;
    await prisma.application.update({
      where: { id: input.applicationId },
      data: {
        matchScore: hybridOverall,
        aiRecommended: isRecommended,
        status: isRecommended ? "SHORTLISTED" : "APPLIED",
        notes: `AI Recommendation: ${matchResult.recommendation}. Match Score: ${hybridOverall}%.`,
      },
    });
  }

  return matchResult;
}
