import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Brain,
  FileCheck,
  CheckCircle2,
  Cpu,
  Database,
  BarChart3,
  Video,
  Target,
  ShieldCheck,
  School,
  Briefcase,
  Layers,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-gradient-to-b from-blue-50/50 via-white to-background dark:from-slate-950 dark:via-background dark:to-background border-b">
        <div className="container relative z-10 max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 dark:bg-blue-950/80 px-3.5 py-1 text-xs font-medium text-blue-800 dark:text-blue-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Autonomous Polyglot AI Recruitment Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            AI-Powered Recruitment & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Campus Placement System
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Automate resume screening, intelligent candidate-job matching, adaptive assessments,
            and AI-powered technical interviews with an explainable multi-agent architecture.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                Register as Student <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                Placement Cell Login
              </Button>
            </Link>
          </div>

          {/* Polyglot badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              PostgreSQL Relational Core
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              MongoDB Recruitment Documents
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              ChromaDB Vector Retrieval
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              8 Specialized AI Agents
            </div>
          </div>
        </div>
      </section>

      {/* 2. POLYGLOT ARCHITECTURE SECTION */}
      <section id="architecture" className="py-20 bg-slate-50 dark:bg-slate-900/30 border-b">
        <div className="container max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider text-blue-600 border-blue-200">
              Polyglot Data Architecture
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Purpose-Built Storage for Every Data Type
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              We never force all data into one database. Each tier handles what it does best:
              relational integrity, schema-free flexibility, or dense vector similarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-t-4 border-t-blue-600 shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 mb-2">
                  <Database className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">PostgreSQL</CardTitle>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Relational Source of Truth
                </p>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-muted-foreground">
                <p>• Users, Roles & RBAC (Student, Admin, Recruiter)</p>
                <p>• Companies, Jobs & Official Applications</p>
                <p>• Assessment metadata, attempts & responses</p>
                <p>• Interview sessions & rubric evaluations</p>
                <p>• Audit logs & persistent notifications</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-emerald-600 shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-2">
                  <Layers className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">MongoDB</CardTitle>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Flexible Document Store
                </p>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-muted-foreground">
                <p>• Parsed resume documents & tech skills</p>
                <p>• Rich job description documents & requirements</p>
                <p>• Full interactive interview transcripts</p>
                <p>• AI generated question pools with explanations</p>
                <p>• Transparent Agent Run audit executions</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-600 shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 mb-2">
                  <Cpu className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">ChromaDB</CardTitle>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Vector Knowledge Retrieval
                </p>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-muted-foreground">
                <p>• Resume competency embeddings</p>
                <p>• Job description semantic embeddings</p>
                <p>• Standardized domain skill taxonomies</p>
                <p>• Fast cosine similarity candidate retrieval</p>
                <p>• RAG-driven contextual interview questions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. AI AGENTS PIPELINE */}
      <section id="agents" className="py-20 border-b">
        <div className="container max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider text-purple-600 border-purple-200">
              Autonomous Intelligence
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              8 Orchestrated Specialized AI Agents
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Coordinated by an auditable Agent Orchestrator that logs every input, retrieval source,
              and decision transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border bg-card hover:border-blue-300 transition-all space-y-2">
              <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
              <h4 className="font-semibold text-sm">Resume Analysis Agent</h4>
              <p className="text-xs text-muted-foreground">Parses skills, experience, calculates Resume Quality Score (0-100), and indexes vectors in ChromaDB.</p>
            </div>

            <div className="p-5 rounded-xl border bg-card hover:border-blue-300 transition-all space-y-2">
              <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
              <h4 className="font-semibold text-sm">JD Analysis Agent</h4>
              <p className="text-xs text-muted-foreground">Structures requirements into required, preferred, soft skills, and academic eligibility criteria.</p>
            </div>

            <div className="p-5 rounded-xl border bg-card hover:border-blue-300 transition-all space-y-2">
              <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">3</div>
              <h4 className="font-semibold text-sm">Hybrid Matching Agent</h4>
              <p className="text-xs text-muted-foreground">Fuses semantic similarity (30%), skill overlap (40%), and academic eligibility (20%) with full explainability.</p>
            </div>

            <div className="p-5 rounded-xl border bg-card hover:border-blue-300 transition-all space-y-2">
              <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">4</div>
              <h4 className="font-semibold text-sm">Question Generation Agent</h4>
              <p className="text-xs text-muted-foreground">Generates authenticated MCQs and problem scenarios with technical explanations and Zod validation.</p>
            </div>

            <div className="p-5 rounded-xl border bg-card hover:border-blue-300 transition-all space-y-2">
              <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">5</div>
              <h4 className="font-semibold text-sm">Adaptive Testing Engine</h4>
              <p className="text-xs text-muted-foreground">Dynamically scales difficulty (Easy → Medium → Hard) based on real-time candidate accuracy and speed.</p>
            </div>

            <div className="p-5 rounded-xl border bg-card hover:border-blue-300 transition-all space-y-2">
              <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">6</div>
              <h4 className="font-semibold text-sm">Adaptive AI Interviewer</h4>
              <p className="text-xs text-muted-foreground">Conducts interactive voice/text technical interviews, asking follow-up questions probing edge cases.</p>
            </div>

            <div className="p-5 rounded-xl border bg-card hover:border-blue-300 transition-all space-y-2">
              <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">7</div>
              <h4 className="font-semibold text-sm">Interview Evaluation Agent</h4>
              <p className="text-xs text-muted-foreground">Scores candidate performance across 5 pillars (Tech, Problem Solving, Communication, Relevance).</p>
            </div>

            <div className="p-5 rounded-xl border bg-card hover:border-blue-300 transition-all space-y-2">
              <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">8</div>
              <h4 className="font-semibold text-sm">Skill Gap Analysis Agent</h4>
              <p className="text-xs text-muted-foreground">Synthesizes test & interview gaps into actionable multi-phase study roadmaps for students.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW SECTION */}
      <section id="workflow" className="py-20 bg-slate-50 dark:bg-slate-900/30 border-b">
        <div className="container max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider text-emerald-600 border-emerald-200">
              End-to-End Recruitment Lifecycle
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How the Autonomous Placement Pipeline Works
            </h2>
          </div>

          <div className="relative border-l-2 border-blue-200 dark:border-blue-900 ml-4 md:ml-32 space-y-8 pl-6">
            <div className="relative">
              <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
              <h4 className="font-semibold text-base text-slate-900 dark:text-white">1. Corporate Job Posting & JD Vectorization</h4>
              <p className="text-sm text-muted-foreground mt-1">Admin or recruiter publishes job. The JD Analysis Agent extracts skills, criteria, and generates ChromaDB vectors.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
              <h4 className="font-semibold text-base text-slate-900 dark:text-white">2. Student Resume Ingestion & Quality Scoring</h4>
              <p className="text-sm text-muted-foreground mt-1">Student registers and uploads resume. The Resume Agent parses competencies, computes quality score, and indexes vectors.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
              <h4 className="font-semibold text-base text-slate-900 dark:text-white">3. Explainable Candidate-Job Matching</h4>
              <p className="text-sm text-muted-foreground mt-1">The Matching Agent evaluates students against jobs using hybrid semantic + skill + eligibility logic with human review safeguards.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
              <h4 className="font-semibold text-base text-slate-900 dark:text-white">4. Adaptive Online Assessment</h4>
              <p className="text-sm text-muted-foreground mt-1">Shortlisted candidates take dynamic tests where question difficulty adjusts in real-time based on responses.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
              <h4 className="font-semibold text-base text-slate-900 dark:text-white">5. Adaptive AI Technical Interview & Final Decision</h4>
              <p className="text-sm text-muted-foreground mt-1">Interactive simulated technical interview with follow-up probing, rubric-based scoring, skill gap roadmap, and admin hire decision.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COLLEGE BENEFITS & RESPONSIBLE AI */}
      <section className="py-20 border-b">
        <div className="container max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="text-xs uppercase tracking-wider text-amber-600 border-amber-200">
              Institutional Advantage
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transforming College Campus Placement Cells
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong className="text-slate-900 dark:text-white">10x Faster Screening:</strong> Screen thousands of student resumes against dozens of visiting company criteria in minutes.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong className="text-slate-900 dark:text-white">Zero Bias & Responsible AI:</strong> Ranking completely ignores protected personal characteristics. Strict explainable decision support.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong className="text-slate-900 dark:text-white">Human-in-the-Loop Override:</strong> Placement officers can review evidence, inspect audit trails, and override any recommendation.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong className="text-slate-900 dark:text-white">Targeted Skill Upskilling:</strong> Pinpoints departmental weaknesses and equips students with clear roadmaps before recruiters arrive.</p>
              </div>
            </div>
          </div>

          <Card className="border bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              Responsible AI Governance
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="font-semibold text-white">Objective Skills Matching</span>
                <p className="text-slate-400 mt-0.5">Focuses exclusively on verified technical skills, projects, and academic coursework.</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="font-semibold text-white">Auditable Execution Log</span>
                <p className="text-slate-400 mt-0.5">Every AI agent execution is logged in MongoDB with model metadata and retrieval provenance.</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="font-semibold text-white">Explainability First</span>
                <p className="text-slate-400 mt-0.5">Every score displays exact percentage breakdowns and evidence citations for faculty review.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-900/30 border-b">
        <div className="container max-w-4xl space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider text-blue-600 border-blue-200">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base font-semibold">How does the Polyglot Architecture keep data clean?</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground pt-0 leading-relaxed">
                PostgreSQL is the single source of truth for users, jobs, applications, and authentication using relational integrity.
                MongoDB handles variable documents like raw resume text, transcripts, and agent run histories.
                ChromaDB provides dense vector embeddings for lightning-fast semantic retrieval and RAG.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base font-semibold">Does the Matching Agent depend only on vector embeddings?</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground pt-0 leading-relaxed">
                No. Section 15 of our design strictly enforces hybrid matching: 30% vector semantic similarity, 40% structured skill overlap,
                20% academic eligibility (CGPA cutoff & degree match), and 10% experience.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base font-semibold">Can Placement Officers override AI recommendations?</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground pt-0 leading-relaxed">
                Yes! The system is designed as an AI decision-support tool. Admins have full access to override AI shortlisting recommendations,
                and every override is recorded in the PostgreSQL audit log.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base font-semibold">How does the Adaptive Assessment engine adjust difficulty?</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground pt-0 leading-relaxed">
                The engine evaluates responses in real-time. A correct response elevates the next item to Medium or Hard, while an incorrect
                response de-escalates to test foundational concepts, calculating an accurate final mastery level.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container max-w-4xl text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Modernize Your Campus Placement Drives?
          </h2>
          <p className="max-w-xl mx-auto text-blue-100 text-sm sm:text-base leading-relaxed">
            Experience the full agentic pipeline today with pre-seeded demo companies (Google, Microsoft, AWS),
            active jobs, adaptive tests, and interactive AI interviews.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-md">
                Try Placement Demo Now
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                Register as Student
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
