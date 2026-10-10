import { prisma } from "../lib/db/prisma";
import { getMongoCollection, COLLECTIONS } from "../lib/db/mongodb";
import { querySimilarDocuments, CHROMA_COLLECTIONS } from "../lib/ai/retrieval/chroma-service";
import { ResumeAnalysisSchema, JDAnalysisSchema, CandidateMatchResultSchema } from "../lib/ai/schemas/ai-schemas";
import { signToken, verifyToken, hashPassword, verifyPassword } from "../lib/auth/auth-utils";
import { runCandidateMatchingAgent } from "../lib/ai/agents/matching-agent";

async function runSystemVerification() {
  console.log("==================================================");
  console.log("RUNNING END-TO-END SYSTEM VERIFICATION SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Test PostgreSQL & Prisma Models
  console.log("--- 1. Relational Database (PostgreSQL) Verification ---");
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@placement.edu" },
    include: { roles: { include: { role: true } }, admin: true },
  });
  assert(adminUser !== null, "Admin user exists in PostgreSQL");
  assert(adminUser?.roles[0]?.role?.name === "ADMIN", "Admin has ADMIN role relation in PostgreSQL");

  const studentUsers = await prisma.studentProfile.findMany({ include: { user: true } });
  assert(studentUsers.length >= 10, `PostgreSQL contains ${studentUsers.length} student profiles (expected >= 10)`);

  const jobs = await prisma.job.findMany({ include: { company: true } });
  assert(jobs.length >= 5, `PostgreSQL contains ${jobs.length} campus jobs across companies`);

  const assessments = await prisma.assessment.findMany({ include: { questions: true } });
  assert(assessments.length >= 3, `PostgreSQL contains ${assessments.length} assessments`);
  const totalQuestions = assessments.reduce((acc, a) => acc + a.questions.length, 0);
  assert(totalQuestions >= 30, `PostgreSQL contains ${totalQuestions} vetted assessment questions (expected >= 30)`);

  // 2. Test MongoDB Document Store
  console.log("\n--- 2. Flexible Document Store (MongoDB) Verification ---");
  const mongoJd = await getMongoCollection(COLLECTIONS.JOB_DESCRIPTIONS);
  const jdDocs = await mongoJd.find({}).toArray();
  assert(jdDocs.length >= 5, `MongoDB contains ${jdDocs.length} flexible Job Description documents`);
  assert(jdDocs[0].requirements?.technicalSkills?.length > 0, "MongoDB JD documents contain technical skill arrays");

  const mongoResumes = await getMongoCollection(COLLECTIONS.RESUME_DOCUMENTS);
  const resumeDocs = await mongoResumes.find({}).toArray();
  assert(resumeDocs.length >= 10, `MongoDB contains ${resumeDocs.length} parsed resume documents`);
  assert(resumeDocs[0].skills?.technical?.length > 0, "MongoDB resume documents contain extracted competencies");

  const mongoAgentRuns = await getMongoCollection(COLLECTIONS.AGENT_RUNS);
  const agentRuns = await mongoAgentRuns.find({}).toArray();
  assert(agentRuns.length >= 2, `MongoDB contains ${agentRuns.length} recorded Agent Runs for auditability`);

  // 3. Test ChromaDB Vector Database
  console.log("\n--- 3. Semantic Vector Store (ChromaDB) Verification ---");
  const simJobs = await querySimilarDocuments(
    CHROMA_COLLECTIONS.JOB_EMBEDDINGS,
    "Python machine learning and artificial intelligence algorithms",
    3
  );
  assert(simJobs.length > 0, `ChromaDB vector query returned ${simJobs.length} similar job embeddings`);
  assert(simJobs[0].similarity > 0.05, `ChromaDB top semantic similarity score is ${Math.round(simJobs[0].similarity * 100)}%`);

  const simResumes = await querySimilarDocuments(
    CHROMA_COLLECTIONS.RESUME_EMBEDDINGS,
    "React TypeScript PostgreSQL developer",
    3
  );
  assert(simResumes.length > 0, `ChromaDB vector query returned ${simResumes.length} similar resume embeddings`);

  // 4. Test Authentication & Passwords
  console.log("\n--- 4. Authentication & Security Verification ---");
  const testHash = await hashPassword("TestPass@123");
  const isValid = await verifyPassword("TestPass@123", testHash);
  assert(isValid, "Bcrypt password hashing and validation succeeds");

  const token = signToken({
    id: "user-test-1",
    email: "test@placement.edu",
    firstName: "Test",
    lastName: "User",
    roles: ["STUDENT"],
  });
  const decoded = verifyToken(token);
  assert(decoded?.email === "test@placement.edu", "JWT sign and verification round-trip succeeds");

  // 5. Test AI Schemas
  console.log("\n--- 5. Zod AI Schema Strict Validation ---");
  const sampleMatch = {
    overallMatchScore: 88,
    factors: {
      semanticScore: 90,
      skillScore: 85,
      eligibilityScore: 100,
      experienceScore: 80,
    },
    recommendation: "Strong Match" as const,
    matchedSkills: ["Python", "SQL"],
    missingSkills: ["Docker"],
    academicEligibility: {
      isEligible: true,
      studentCGPA: 8.65,
      requiredCGPA: 7.0,
      degreeMatch: true,
    },
    evidenceAndExplanation: "Candidate satisfies all mandatory competencies.",
    strengths: ["Solid fundamentals"],
    concerns: ["Needs cloud containerization experience"],
  };
  const validatedMatch = CandidateMatchResultSchema.safeParse(sampleMatch);
  assert(validatedMatch.success, "CandidateMatchResultSchema validates expected structured output format");

  // 6. Test Hybrid Candidate Matching Agent
  console.log("\n--- 6. Hybrid Candidate Matching Agent Execution ---");
  const student = studentUsers[0];
  const targetJob = jobs[0];
  const liveMatch = await runCandidateMatchingAgent({
    studentId: student.id,
    jobId: targetJob.id,
  });
  assert(liveMatch.overallMatchScore >= 0 && liveMatch.overallMatchScore <= 100, `Matching Agent generated overall score: ${liveMatch.overallMatchScore}%`);
  assert(liveMatch.factors.semanticScore > 0, `Matching Agent semantic factor: ${liveMatch.factors.semanticScore}%`);
  assert(liveMatch.factors.skillScore > 0, `Matching Agent skill overlap factor: ${liveMatch.factors.skillScore}%`);
  assert(liveMatch.academicEligibility.isEligible === true, "Academic eligibility verified");

  console.log("\n==================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");

  await prisma.$disconnect();
}

runSystemVerification().catch((e) => {
  console.error("Verification error:", e);
  process.exit(1);
});
