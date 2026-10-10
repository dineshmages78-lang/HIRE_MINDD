import { z } from "zod";

// ----------------------------------------
// RESUME ANALYSIS SCHEMAS
// ----------------------------------------

export const ResumeSkillSchema = z.object({
  name: z.string(),
  category: z.enum(["programming", "framework", "database", "cloud_devops", "ai_ml", "soft_skill", "tool"]),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  yearsOfExperience: z.number().optional(),
});

export const ResumeEducationSchema = z.object({
  degree: z.string(),
  fieldOfStudy: z.string(),
  institution: z.string(),
  graduationYear: z.number().optional(),
  cgpaOrPercentage: z.string().optional(),
});

export const ResumeExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  duration: z.string().optional(),
  highlights: z.array(z.string()),
});

export const ResumeProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  link: z.string().optional(),
});

export const ResumeAnalysisSchema = z.object({
  summary: z.string(),
  candidateName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  technicalSkills: z.array(ResumeSkillSchema),
  softSkills: z.array(z.string()),
  education: z.array(ResumeEducationSchema),
  experience: z.array(ResumeExperienceSchema),
  projects: z.array(ResumeProjectSchema),
  certifications: z.array(z.string()),
  resumeQualityScore: z.number().min(0).max(100),
  keyStrengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

// ----------------------------------------
// JOB DESCRIPTION ANALYSIS SCHEMAS
// ----------------------------------------

export const JDRequirementsSchema = z.object({
  technicalSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  softSkills: z.array(z.string()),
});

export const JDEducationSchema = z.object({
  minimumDegree: z.string(),
  preferredFields: z.array(z.string()),
  minimumCGPA: z.number(),
});

export const JDExperienceSchema = z.object({
  minimumYears: z.number(),
  preferredExperience: z.string().optional(),
});

export const JDAnalysisSchema = z.object({
  jobTitle: z.string(),
  department: z.string().optional(),
  summary: z.string(),
  requirements: JDRequirementsSchema,
  responsibilities: z.array(z.string()),
  education: JDEducationSchema,
  experience: JDExperienceSchema,
  difficultyLevel: z.enum(["entry", "mid", "senior"]).default("entry"),
  importantKeywords: z.array(z.string()),
});

export type JDAnalysis = z.infer<typeof JDAnalysisSchema>;

// ----------------------------------------
// CANDIDATE MATCHING SCHEMAS
// ----------------------------------------

export const MatchFactorBreakdownSchema = z.object({
  semanticScore: z.number().min(0).max(100),
  skillScore: z.number().min(0).max(100),
  eligibilityScore: z.number().min(0).max(100),
  experienceScore: z.number().min(0).max(100),
});

export const CandidateMatchResultSchema = z.object({
  overallMatchScore: z.number().min(0).max(100),
  factors: MatchFactorBreakdownSchema,
  recommendation: z.enum(["Strong Match", "Potential Match", "Low Match", "Not Eligible"]),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  academicEligibility: z.object({
    isEligible: z.boolean(),
    studentCGPA: z.number(),
    requiredCGPA: z.number(),
    degreeMatch: z.boolean(),
  }),
  evidenceAndExplanation: z.string(),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
});

export type CandidateMatchResult = z.infer<typeof CandidateMatchResultSchema>;

// ----------------------------------------
// ASSESSMENT SCHEMAS
// ----------------------------------------

export const GeneratedQuestionSchema = z.object({
  text: z.string(),
  options: z.array(z.string()).min(4).max(4),
  correctOption: z.number().min(0).max(3),
  explanation: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  skill: z.string(),
  topic: z.string(),
});

export const QuestionBatchSchema = z.object({
  assessmentTitle: z.string(),
  questions: z.array(GeneratedQuestionSchema),
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

export const AdaptiveNextQuestionSchema = z.object({
  nextQuestionId: z.string().optional(),
  recommendedDifficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  rationale: z.string(),
  currentMasteryLevel: z.number().min(0).max(100),
  terminateEarly: z.boolean().default(false),
});

export type AdaptiveDecision = z.infer<typeof AdaptiveNextQuestionSchema>;

// ----------------------------------------
// INTERVIEW EVALUATION SCHEMAS
// ----------------------------------------

export const InterviewFollowUpSchema = z.object({
  followUpQuestion: z.string(),
  topic: z.string(),
  probeTarget: z.string(), // what aspect we are checking (e.g. depth, edge case)
  encouragement: z.string().optional(),
});

export const InterviewEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  problemSolvingScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  roleRelevanceScore: z.number().min(0).max(100),
  decision: z.enum(["HIRE", "CONSIDER", "REJECT"]),
  strengths: z.array(z.string()),
  weakAreas: z.array(z.string()),
  detailedFeedback: z.string(),
  hiringRecommendation: z.string(),
});

export type InterviewEvaluation = z.infer<typeof InterviewEvaluationSchema>;

// ----------------------------------------
// SKILL GAP ANALYSIS SCHEMAS
// ----------------------------------------

export const SkillGapItemSchema = z.object({
  skill: z.string(),
  requiredLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  currentLevel: z.enum(["None", "Beginner", "Intermediate", "Advanced"]),
  gapSeverity: z.enum(["None", "Low", "Medium", "High", "Critical"]),
  priority: z.enum(["Critical", "High", "Medium", "Low"]),
  recommendedActions: z.array(z.string()),
});

export const SkillGapReportSchema = z.object({
  overallReadinessScore: z.number().min(0).max(100),
  summary: z.string(),
  gaps: z.array(SkillGapItemSchema),
  learningRoadmap: z.array(
    z.object({
      phase: z.string(),
      timeline: z.string(),
      topics: z.array(z.string()),
      projectIdea: z.string(),
    })
  ),
});

export type SkillGapReport = z.infer<typeof SkillGapReportSchema>;
