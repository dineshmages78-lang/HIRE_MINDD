# Agentic AI-Based Intelligent Recruitment and Placement System
### For Automated Resume Screening, Adaptive Assessment, and Interview Evaluation

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748.svg)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.10-47A248.svg)](https://www.mongodb.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-orange.svg)](https://www.trychroma.com/)

A production-grade, full-stack campus recruitment platform engineered for universities, placement cells, students, and corporate recruiters. The platform orchestrates 8 specialized AI agents across a **polyglot data architecture** to automate resume screening, candidate-job matching, adaptive testing, AI interviews, and skill-gap intelligence with explainability and human oversight.

---

## 1. System Architecture & Polyglot Storage Tier

The platform strictly segregates relational integrity, flexible recruitment documents, and dense vector embeddings:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL (Prisma ORM)                         │
│  Relational Source of Truth                                            │
│  • Users, Roles & RBAC (STUDENT, ADMIN, RECRUITER)                     │
│  • Student Profiles, Admin Profiles, Recruiter Profiles, Companies     │
│  • Jobs, Applications, Assessments metadata, Attempts & Responses      │
│  • Interview Sessions, Rubric Evaluations, Notifications & Audit Logs  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ foreign-key references
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│                                MongoDB                                 │
│  Flexible & Unstructured Recruitment Documents                         │
│  • job_descriptions: Parsed requirements, responsibilities, AI specs   │
│  • resume_documents: Parsed text, skills taxonomy, projects, education │
│  • interview_transcripts: Multi-turn chat context & evaluator hints    │
│  • ai_generated_questions: Generated question pools & explanations     │
│  • skill_analysis: Gap matrices & multi-phase learning roadmaps        │
│  • agent_runs: Transparent execution telemetry for auditability        │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ vector embeddings
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│                               ChromaDB                                 │
│  Semantic Retrieval & Vector Knowledge Store                           │
│  • resume_embeddings: Candidate competencies and project vectors       │
│  • job_embeddings: Requirement and responsibility semantic chunks      │
│  • skill_embeddings: Standardized domain skill taxonomies              │
│  • interview_embeddings: Dynamic context retrieval for interview follow-ups
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ semantic retrieval & context
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│                         AI Multi-Agent Layer                           │
│  1. Resume Analysis Agent          5. Adaptive Assessment Engine       │
│  2. JD Analysis Agent              6. Adaptive AI Interviewer          │
│  3. Hybrid Matching Agent          7. Interview Evaluation Agent       │
│  4. Question Generation Agent      8. Skill Gap Intelligence Agent     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

- **Frontend & App Framework**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Recharts (Data Visualizations).
- **Primary Relational Database**: PostgreSQL 18 with Prisma ORM.
- **Document Database**: MongoDB with native collection accessors & persistent local fallback store.
- **Vector Database**: ChromaDB vector store with dense cosine-similarity retrieval.
- **AI & Reasoning Layer**: Multi-provider abstraction (`Google Gemini`, `OpenAI`, and built-in offline heuristic reasoning engine) with strict Zod schema validation.
- **Authentication & Security**: Secure bcrypt password hashing, JWT session cookies, RBAC route guards.

---

## 3. The 8 Specialized AI Agents

1. **Resume Analysis Agent (`resume-analysis-agent.ts`)**: Parses student resumes, extracts technical & soft skills with proficiencies, calculates Resume Quality Score (0-100), stores document in MongoDB, and indexes vectors in ChromaDB.
2. **JD Analysis Agent (`jd-analysis-agent.ts`)**: Ingests corporate job specs, extracts required vs preferred skills, academic eligibility cutoffs, and generates ChromaDB vectors.
3. **Hybrid Candidate Matching Agent (`matching-agent.ts`)**: Evaluates candidate fit using a 4-pillar hybrid formula:
   $$\text{Final Score} = 0.3 \times \text{Semantic} + 0.4 \times \text{Skill Overlap} + 0.2 \times \text{Eligibility} + 0.1 \times \text{Experience}$$
   Produces explainable evidence citations and enables Human-in-the-Loop overrides.
4. **Assessment Question Generation Agent (`assessment-generation-agent.ts`)**: Generates authenticated MCQs and problem scenarios with technical explanations, difficulty tags, and Zod verification.
5. **Adaptive Assessment Agent (`adaptive-assessment-agent.ts`)**: Dynamic Item Response Engine that escalates difficulty on correct answers (Easy → Medium → Hard) and de-escalates on errors to test foundational concepts.
6. **Adaptive AI Interview Agent (`interview-agent.ts`)**: Conducts realistic technical interviews, analyzing candidate responses and probing edge cases and architectural trade-offs using ChromaDB context.
7. **Interview Evaluation Agent (`interview-evaluation-agent.ts`)**: Evaluates interview transcripts across 5 pillars (Technical Knowledge, Problem Solving, Communication, Role Relevance) and generates HIRE / CONSIDER / REJECT decisions.
8. **Skill Gap Analysis Agent (`skill-gap-agent.ts`)**: Cross-references requirements, test performance, and interview results to generate a Skill Gap Matrix and a tailored multi-phase study roadmap.

---

## 4. Setup & Installation

### Prerequisites
- Node.js 18+ (tested on Node.js v22.16)
- PostgreSQL running locally (port 5432) or a remote connection string.

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
# PostgreSQL Connection (Primary Relational Database via Prisma)
DATABASE_URL="postgresql://postgres:post123@localhost:5432/placement_db?schema=public"

# MongoDB Connection (Flexible / Unstructured Documents)
MONGODB_URI="mongodb://localhost:27017/placement_docs"

# ChromaDB Connection (Vector Embeddings & Semantic Retrieval)
CHROMA_URL="http://localhost:8000"

# AI Provider API Key (Gemini or OpenAI)
AI_API_KEY="demo-key"
AI_PROVIDER="gemini"

# NextAuth / JWT Authentication Secrets
NEXTAUTH_SECRET="agentic-placement-system-super-secret-key-32chars"
NEXTAUTH_URL="http://localhost:3000"
```

> **Zero-Friction Fallback**: If MongoDB or ChromaDB services are not locally running on your workstation, the system automatically engages high-performance local fallback engines (persistent file-backed document store and in-process vector cosine similarity store).

### 3. Initialize Database & Seed Demo Data
```bash
# Push schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Populate PostgreSQL, MongoDB, and ChromaDB with demo data
npm run seed
```

### 4. Run System Verification Suite
```bash
npm run verify
```
*Executes 21 automated end-to-end integration tests verifying PostgreSQL models, MongoDB documents, ChromaDB vector retrieval, Zod schemas, and matching agents.*

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Demo Credentials

| Role | Email | Password | Portal Features |
| :--- | :--- | :--- | :--- |
| **Placement Admin** | `admin@placement.edu` | `Placement@123` | Placement Hub, Post Jobs with JD Agent, Shortlist Overrides, AI Question Generator, Interview Reviews, Analytics, Agent Runs & Audit Trail |
| **Student** | `student1@placement.edu` | `Placement@123` | Student Dashboard, AI Resume Hub, Matched Jobs & 1-Click Apply, Live Adaptive Test Room, Live AI Interview Room, Skill Gap Roadmap |
| **Recruiter** | `sarah.recruiter@google.com` | `Placement@123` | Recruiter Dashboard, Company Job Postings, Applicant Match Roster |

---

## 6. Production Build & Deployment

```bash
# Production Next.js Build
npm run build

# Start Production Server
npm run start
```
