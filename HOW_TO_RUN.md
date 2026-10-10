# System Startup & Execution Guide

This document provides complete instructions for setting up, running, and testing both the **Frontend** and **Backend** of the **Agentic AI-Based Intelligent Recruitment and Placement System**.

---

## 1. System Architecture Overview

This project is built using a modern **unified full-stack architecture** with Next.js 14 App Router:

```text
┌────────────────────────────────────────────────────────────────────────┐
│               Unified Next.js Application (Port 3000)                  │
├───────────────────────────────────┬────────────────────────────────────┤
│             FRONTEND              │              BACKEND               │
│   • Landing Page (/)              │   • API Routes (/api/*)            │
│   • Student Portal (/student/*)   │   • Authentication & RBAC JWTs     │
│   • Admin Portal (/admin/*)       │   • 8 AI Agent Pipelines           │
│   • Recruiter Portal (/recruiter) │   • Prisma ORM Query Engine        │
│   • Responsive Tailwind & Charts  │   • MongoDB & ChromaDB Drivers     │
└───────────────────────────────────┴────────────────────────────────────┘
                                    │
                                    ↓
       ┌────────────────────────────┼───────────────────────────┐
       ↓                            ↓                           ↓
┌──────────────┐             ┌──────────────┐            ┌──────────────┐
│  PostgreSQL  │             │   MongoDB    │            │   ChromaDB   │
│ (Relational) │             │ (Documents)  │            │ (Vector DB)  │
└──────────────┘             └──────────────┘            └──────────────┘
```

> **Note**: Because the project is a unified full-stack application, running `npm run dev` or `npm start` **starts both the frontend and the backend simultaneously** on a single server at `http://localhost:3000`.

---

## 2. Prerequisites

Ensure you have the following installed on your machine:
* **Node.js**: v18.0.0 or later (Node.js v20+ recommended)
* **npm**: v9.0.0 or later
* **PostgreSQL**: Local instance running on port `5432` or a remote PostgreSQL database connection string (e.g. Neon, Supabase, AWS RDS).

*(Optional)*:
* **MongoDB**: If running locally on port `27017` (if not running, the system automatically uses the persistent local file fallback store in `.mongo_local_store/`).
* **ChromaDB**: If running locally on port `8000` (if not running, the system automatically uses the in-process vector fallback store in `.chroma_local_store/`).

---

## 3. Quick Start in 4 Steps

### Step 1: Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

---

### Step 2: Configure Environment Variables
Verify or create your `.env` file in the root directory:
```env
# PostgreSQL Database URL (Primary Relational Store)
DATABASE_URL="postgresql://postgres:post123@localhost:5432/placement_db?schema=public"

# MongoDB URI (Unstructured Documents Store)
MONGODB_URI="mongodb://localhost:27017/placement_docs"

# ChromaDB Vector Store URL (Semantic Retrieval)
CHROMA_URL="http://localhost:8000"

# AI Provider Configuration (Google Gemini or OpenAI)
# Set to your Gemini API key or OpenAI key, or leave as demo-key for built-in local heuristic reasoning
AI_API_KEY="demo-key"
AI_PROVIDER="gemini"

# NextAuth / JWT Authentication Secrets
NEXTAUTH_SECRET="agentic-placement-system-super-secret-key-32chars"
NEXTAUTH_URL="http://localhost:3000"
```

---

### Step 3: Initialize Database & Seed Demo Data
Push the relational schema to PostgreSQL and populate sample data:

```bash
# 1. Push schema tables to PostgreSQL
npm run prisma:push

# 2. Generate Prisma client types
npm run prisma:generate

# 3. Seed database with Admin, Recruiters, Students, Jobs, Questions, and Vector Embeddings
npm run seed
```

---

### Step 4: Start the Full-Stack Server

#### Development Mode (Recommended for testing and development)
Starts both Frontend and Backend with hot reload:
```bash
npm run dev
```
Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

#### Production Mode (Optimized production build)
```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 4. How to Access Frontend & Backend

### Frontend Pages
* **Public Landing Page**: `http://localhost:3000/`
* **Login**: `http://localhost:3000/login`
* **Student Dashboard**: `http://localhost:3000/student/dashboard`
* **Student Resume & AI Scoring**: `http://localhost:3000/student/resume`
* **Student Adaptive Assessment**: `http://localhost:3000/student/assessments`
* **Student AI Interview**: `http://localhost:3000/student/interviews`
* **Student Skill Gap & Learning Roadmap**: `http://localhost:3000/student/skills`
* **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
* **Admin Candidate Ranking & Overrides**: `http://localhost:3000/admin/candidates`
* **Admin Analytics**: `http://localhost:3000/admin/analytics`
* **Admin AI Agent Execution Logs**: `http://localhost:3000/admin/agent-logs`
* **Recruiter Portal**: `http://localhost:3000/recruiter/dashboard`

### Backend REST API Endpoints
All backend endpoints are accessible at `http://localhost:3000/api/*`:
* **Authentication**:
  * `POST /api/auth/login` - Authenticate user & issue JWT
  * `POST /api/auth/register` - Student registration
  * `GET  /api/auth/me` - Fetch authenticated user session
  * `POST /api/auth/logout` - Clear session cookies
* **AI Agent Services**:
  * `POST /api/ai/parse-resume` - Resume Analysis Agent
  * `POST /api/ai/parse-jd` - JD Analysis Agent
  * `POST /api/ai/match` - Hybrid Candidate Matching Agent
  * `POST /api/ai/next-question` - Adaptive Assessment Agent (IRT Engine)
  * `POST /api/ai/interview-message` - AI Interview Agent (Conversational follow-ups)
  * `POST /api/ai/evaluate-interview` - Interview Evaluation Agent
  * `POST /api/ai/skill-gap` - Skill Gap Analysis Agent
* **Campus Management**:
  * `GET /api/jobs` - List active campus jobs
  * `GET /api/applications` - Student application management
  * `GET /api/assessments` - Assessment metadata & questions

---

## 5. Demo Accounts & Credentials

The seed script (`npm run seed`) populates ready-to-use accounts with password **`Placement@123`**:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin (TPO)** | `admin@placement.edu` | `Placement@123` | Head of Placement & Industry Relations |
| **Recruiter (Google)** | `sarah.recruiter@google.com` | `Placement@123` | Google Campus Talent Lead |
| **Recruiter (Microsoft)** | `michael.recruiter@microsoft.com` | `Placement@123` | Microsoft Campus Recruiter |
| **Student (Alex Sharma)** | `student1@placement.edu` | `Placement@123` | Final-year CS student (8.65 CGPA) |
| **Student (Priya Patel)** | `student2@placement.edu` | `Placement@123` | Final-year CS student (9.15 CGPA) |
| **Student (Rohan Gupta)** | `student3@placement.edu` | `Placement@123` | Final-year IT student (7.85 CGPA) |

---

## 6. System Verification & Health Check

You can run the end-to-end automated verification suite at any time:
```bash
npm run verify
```
This runs 21 automated tests verifying:
1. PostgreSQL connection & relational models (Users, Jobs, Assessments, Questions).
2. MongoDB connection & flexible documents (`job_descriptions`, `resume_documents`, `agent_runs`).
3. ChromaDB semantic vector search across candidate and job embeddings.
4. Authentication (bcrypt hash round-trip & JWT signing).
5. Zod schema validation for all structured AI responses.
6. Live execution of the Hybrid Candidate Matching Agent.

---

## 7. Troubleshooting

* **Port 3000 is already in use:**
  Run on an alternate port:
  ```bash
  npx next dev -p 3001
  ```
* **PostgreSQL connection refused (`ECONNREFUSED 127.0.0.1:5432`):**
  Ensure PostgreSQL is started on your system:
  * *Windows Services*: Press `Win + R`, type `services.msc`, locate `postgresql-x64-XX`, right click and click **Start**.
  * Or update `DATABASE_URL` in `.env` to point to your active database.
* **MongoDB or ChromaDB services not running:**
  No configuration needed! The system automatically detects missing remote services and engages persistent file-backed fallback stores (`.mongo_local_store/` and `.chroma_local_store/`) without interrupting execution.
