# User Manual: Agentic AI-Based Intelligent Recruitment and Placement System

Welcome to the **Agentic AI-Based Intelligent Recruitment and Placement System**. This platform automates and streamlines the complete campus hiring lifecycle using an ensemble of 8 specialized AI agents and a polyglot data architecture (PostgreSQL, MongoDB, and ChromaDB).

This manual provides complete step-by-step instructions for all three user roles:
1. **Students** (Candidates)
2. **Placement Cell Administrators** (TPO / Faculty Placement Officers)
3. **Corporate Recruiters** (Company Talent Acquisition)

---

## Table of Contents

1. [Platform Access & Default Logins](#1-platform-access--default-logins)
2. [Student Guide](#2-student-guide)
   * 2.1 [Registration & Login](#21-registration--login)
   * 2.2 [Profile Completion](#22-profile-completion)
   * 2.3 [Resume Upload & AI Quality Scoring](#23-resume-upload--ai-quality-scoring)
   * 2.4 [Browsing Jobs & AI Match Scores](#24-browsing-jobs--ai-match-scores)
   * 2.5 [Taking Adaptive Skill Assessments](#25-taking-adaptive-skill-assessments)
   * 2.6 [Undergoing AI-Powered Mock/Technical Interviews](#26-undergoing-ai-powered-mocktechnical-interviews)
   * 2.7 [Skill Gap Analysis & Personalized Study Roadmap](#27-skill-gap-analysis--personalized-study-roadmap)
   * 2.8 [Tracking Notifications & Applications](#28-tracking-notifications--applications)
3. [Administrator / Placement Officer (TPO) Guide](#3-administrator--placement-officer-tpo-guide)
   * 3.1 [Admin Overview & Real-Time KPI Dashboard](#31-admin-overview--real-time-kpi-dashboard)
   * 3.2 [Managing Student Records & Eligibility](#32-managing-student-records--eligibility)
   * 3.3 [Managing Companies & Job Postings](#33-managing-companies--job-postings)
   * 3.4 [Job Description (JD) AI Ingestion & Vector Indexing](#34-job-description-jd-ai-ingestion--vector-indexing)
   * 3.5 [Candidate Shortlisting & Human-in-the-Loop Overrides](#35-candidate-shortlisting--human-in-the-loop-overrides)
   * 3.6 [Creating Assessments & AI Question Generation](#36-creating-assessments--ai-question-generation)
   * 3.7 [Evaluating AI Interview Sessions](#37-evaluating-ai-interview-sessions)
   * 3.8 [Campus Analytics & Department Placement Visualizations](#38-campus-analytics--department-placement-visualizations)
   * 3.9 [Publishing Announcements & Broadcasts](#39-publishing-announcements--broadcasts)
   * 3.10 [System Audit Logs & AI Agent Execution Telemetry](#310-system-audit-logs--ai-agent-execution-telemetry)
4. [Corporate Recruiter Guide](#4-corporate-recruiter-guide)
   * 4.1 [Recruiter Dashboard](#41-recruiter-dashboard)
   * 4.2 [Posting Campus Drives & Specifying Skill Criteria](#42-posting-campus-drives--specifying-skill-criteria)
   * 4.3 [Reviewing AI-Ranked Candidate Pipelines](#43-reviewing-ai-ranked-candidate-pipelines)
   * 4.4 [Inspecting Candidate Resumes, Test Scores & AI Interview Decisions](#44-inspecting-candidate-resumes-test-scores--ai-interview-decisions)
5. [Understanding the AI Agents & Scoring Logic](#5-understanding-the-ai-agents--scoring-logic)
6. [Responsible AI, Transparency & Compliance](#6-responsible-ai-transparency--compliance)
7. [Frequently Asked Questions (FAQ)](#7-frequently-asked-questions-faq)

---

## 1. Platform Access & Default Logins

The application is hosted at:
**`http://localhost:3000`**

### Pre-Configured Demo Credentials
All seeded demo accounts use the standard password: **`Placement@123`**

| Portal | Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **Admin (TPO)** | `admin@placement.edu` | `Placement@123` | Head of Training & Placement |
| **Recruiter (Google)** | `sarah.recruiter@google.com` | `Placement@123` | Google Campus Talent Lead |
| **Recruiter (Microsoft)**| `michael.recruiter@microsoft.com` | `Placement@123` | Microsoft University Recruiter |
| **Student (Alex)** | `student1@placement.edu` | `Placement@123` | CS Final Year, 8.65 CGPA |
| **Student (Priya)** | `student2@placement.edu` | `Placement@123` | CS Final Year, 9.15 CGPA |
| **Student (Rohan)** | `student3@placement.edu` | `Placement@123` | IT Final Year, 7.85 CGPA |

---

## 2. Student Guide

### 2.1 Registration & Login
1. Navigate to **[http://localhost:3000/register](http://localhost:3000/register)** if you are a new student.
2. Fill in your institutional email, password, student roll number, department, degree program, graduation year, and current CGPA.
3. Click **Create Account**.
4. If you already have an account, navigate to **[http://localhost:3000/login](http://localhost:3000/login)** and sign in with your email and password.

---

### 2.2 Profile Completion
* Route: **`/student/profile`**
* Review your academic details, contact information, degree branch, and placement status.
* Keeping your CGPA and contact info updated ensures that the **Hybrid Matching Agent** correctly calculates your academic eligibility for recruitment drives.

---

### 2.3 Resume Upload & AI Quality Scoring
* Route: **`/student/resume`**
1. **Upload Resume**: Click **Upload Resume** and select your PDF resume file.
2. **Automated AI Extraction**: The **Resume Analysis Agent** instantly extracts:
   * **Technical Skills** (categorized into Programming, Frameworks, Databases, Cloud/DevOps, AI/ML)
   * **Soft Skills** (Communication, Problem Solving, Leadership, Teamwork)
   * **Work & Internship Experience**
   * **Projects & Academic Credentials**
3. **Resume Quality Score (0–100)**: The AI calculates an instant score highlighting:
   * Key strengths in your resume
   * Missing critical sections or improvement suggestions
4. **Semantic Indexing**: Behind the scenes, the agent embeds your resume into **ChromaDB** for semantic job matching.

---

### 2.4 Browsing Jobs & AI Match Scores
* Route: **`/student/jobs`**
1. View all active campus opportunities posted by verified partner companies.
2. Every job card displays a **Personalized Match Score (%)** computed by the **Hybrid Candidate Matching Agent**:
   * **Semantic Similarity (30%)**: Content alignment between your resume and the job role.
   * **Skill Overlap (40%)**: Ratio of matched vs. missing technical competencies.
   * **Eligibility (20%)**: Verification of your CGPA against the minimum cutoff.
   * **Experience (10%)**: Project and internship relevance.
3. Click on any job to view:
   * Full job responsibilities & required technical stack
   * Green badges for skills you possess
   * Red badges for missing skills
   * CGPA cutoff status
4. Click **Apply Now** to submit your application.

---

### 2.5 Taking Adaptive Skill Assessments
* Route: **`/student/assessments`**
1. Once shortlisted or invited, your pending tests appear under your assessment list.
2. Click **Start Assessment** to launch the test interface.
3. **Adaptive Item Response Testing**:
   * The questions adapt dynamically to your answers.
   * Answer correctly $\rightarrow$ the system presents a higher difficulty question (**Easy $\rightarrow$ Medium $\rightarrow$ Hard**).
   * Answer incorrectly $\rightarrow$ the system drops to a lower difficulty question to test foundational concepts.
4. Each question has a time tracker and 4 multiple-choice options.
5. Click **Submit Test** when finished to receive your score, accuracy rate, and difficulty mastery breakdown immediately.

---

### 2.6 Undergoing AI-Powered Mock/Technical Interviews
* Route: **`/student/interviews`**
1. Click **Launch Interview Session** for your scheduled interview.
2. **Conversational AI Interviewer**:
   * The AI interviewer introduces itself and asks technical questions tailored specifically to the job role and your resume.
   * As you type or speak your answer, the agent analyzes your response and asks contextual follow-up questions probing depth, edge cases, and architectural trade-offs.
3. Click **Finish Interview** once all rounds of questions conclude.
4. The **Interview Evaluation Agent** evaluates your transcript across 5 key dimensions:
   * *Technical Knowledge*
   * *Problem Solving*
   * *Communication Skills*
   * *Conceptual Understanding*
   * *Role Relevance*
5. Review your comprehensive score report and hiring recommendation decision (**HIRE / CONSIDER / REJECT**).

---

### 2.7 Skill Gap Analysis & Personalized Study Roadmap
* Route: **`/student/skills`**
1. The **Skill Gap Analysis Agent** correlates your target job requirements, resume competencies, test attempts, and interview transcripts.
2. **Skill Gap Matrix**:
   * View each skill with required level vs. your current evaluated level.
   * Severity tags: *None*, *Low*, *Medium*, *High*, *Critical*.
3. **Phased Learning Roadmap**:
   * **Phase 1 (Week 1–2)**: Immediate gap remediation.
   * **Phase 2 (Week 3–4)**: Intermediate concepts and framework mastery.
   * **Phase 3 (Week 5+)**: Capstone project and production deployment practice.

---

### 2.8 Tracking Notifications & Applications
* Route: **`/student/notifications`**
* Receive instant updates regarding:
  * Application status changes (Applied $\rightarrow$ Shortlisted $\rightarrow$ Offered)
  * Assessment invitations and deadlines
  * Interview schedules and evaluation reports
  * Campus placement announcements from the TPO

---

## 3. Administrator / Placement Officer (TPO) Guide

### 3.1 Admin Overview & Real-Time KPI Dashboard
* Route: **`/admin/dashboard`**
* Monitor campus placement health in real-time:
  * **Total Registered Students**
  * **Active Campus Recruitment Drives**
  * **Total Applications Submitted**
  * **Completed Assessments & Average Scores**
  * **Conducted AI Interviews**
  * **Students Shortlisted & Offered**

---

### 3.2 Managing Student Records & Eligibility
* Route: **`/admin/students`**
1. Search and filter candidates by Department (CS, IT, ECE, AI/ML, Data Science), Degree, CGPA, or Placement Status.
2. View detailed student cards with:
   * Contact details and roll numbers
   * Uploaded resume status and AI Resume Quality Score
   * Current applications and test scores

---

### 3.3 Managing Companies & Job Postings
* Routes: **`/admin/companies`** and **`/admin/jobs`**
1. **Create Company**: Register hiring partners (e.g. Google, Microsoft, Amazon) with location, industry, and recruiter contacts.
2. **Publish Campus Job**: Define title, department, minimum CGPA eligibility, compensation, job deadline, and employment type.

---

### 3.4 Job Description (JD) AI Ingestion & Vector Indexing
1. When creating a job, paste the unstructured raw Job Description text.
2. The **JD Analysis Agent** automatically:
   * Parses required vs. preferred technical skills
   * Identifies soft skills, role responsibilities, and seniority level
   * Saves the structured document in **MongoDB** (`job_descriptions` collection)
   * Generates vector embeddings and stores them in **ChromaDB** (`job_embeddings` collection) for candidate matching

---

### 3.5 Candidate Shortlisting & Human-in-the-Loop Overrides
* Route: **`/admin/candidates`**
1. Select a job to view all applicant rankings sorted by **AI Hybrid Match Score**.
2. **Explainability Modal**: Click on any candidate to inspect:
   * Exact breakdown of Semantic, Skill, Eligibility, and Experience scores
   * Matched skills vs. missing skills
   * Textual justification and citations generated by the AI
3. **Human Review Override**:
   * As an administrator, you have complete authority to override AI recommendations.
   * Change status to **SHORTLISTED**, **REJECTED**, or **OFFERED**.
   * Add administrative notes explaining the decision (e.g. *"Approved by TPO Dr. Verma"*).

---

### 3.6 Creating Assessments & AI Question Generation
* Route: **`/admin/assessments`**
1. View all active assessments linked to company jobs.
2. Click **Generate Questions with AI**:
   * Specify Job Role, Skill Focus (e.g., Data Structures, ML, System Design), and Difficulty.
   * The **Question Generation Agent** generates verified 4-option MCQs with explanations.
3. Review and approve questions before publishing them to students.

---

### 3.7 Evaluating AI Interview Sessions
* Route: **`/admin/interviews`**
1. View completed and in-progress interview sessions across all candidates.
2. Inspect the complete **multi-turn dialogue transcript** stored in MongoDB.
3. View the 5-pillar rubric evaluation scores (Technical, Problem Solving, Communication, Conceptual, Role Relevance) and the final decision (**HIRE / CONSIDER / REJECT**).

---

### 3.8 Campus Analytics & Department Placement Visualizations
* Route: **`/admin/analytics`**
Interactive Recharts visualizations covering:
* **Department-Wise Placement Rates**: Placement percentages across CS, IT, ECE, and AI/ML.
* **Assessment Score Distributions**: Performance curves and pass rates.
* **Skill Demand vs. Campus Supply**: Most requested industry technologies compared against student profile proficiencies.
* **Recruitment Funnel**: Applied $\rightarrow$ Shortlisted $\rightarrow$ Tested $\rightarrow$ Interviewed $\rightarrow$ Placed.

---

### 3.9 Publishing Announcements & Broadcasts
* Route: **`/admin/announcements`**
1. Post campus-wide placement circulars, drive dates, or company registration deadlines.
2. Target announcements to specific audiences (**ALL**, **FINAL_YEAR**, or **SPECIFIC_DEPARTMENT**).
3. Broadcast notifications automatically appear on student dashboards.

---

### 3.10 System Audit Logs & AI Agent Execution Telemetry
* Routes: **`/admin/audit-logs`** and **`/admin/agent-logs`**
* **Audit Logs (PostgreSQL)**: Every sensitive operation (login, job modification, candidate status override, test submission) is immutably logged with timestamp, user ID, and IP address.
* **AI Agent Runs (MongoDB `agent_runs`)**:
  * Inspect every AI execution across all 8 agents.
  * Details include: execution duration, model version, retrieval sources used, input snapshots, and structured results.
  * Guarantees transparency and auditability for university accreditations.

---

## 4. Corporate Recruiter Guide

### 4.1 Recruiter Dashboard
* Route: **`/recruiter/dashboard`**
* Corporate recruiters can view active drives associated with their company, incoming applications, and shortlisted talent.

### 4.2 Posting Campus Drives & Specifying Skill Criteria
* Route: **`/recruiter/jobs`**
1. Post new campus openings with customized CGPA cutoffs and skill requirements.
2. View parsed skill requirements generated by the JD Analysis Agent.

### 4.3 Reviewing AI-Ranked Candidate Pipelines
* Route: **`/recruiter/candidates`**
1. Inspect candidates ranked automatically by the Hybrid Matching Agent.
2. Filter candidates based on:
   * Match Score percentage
   * Department and CGPA
   * Specific required skills (e.g. Python, Docker, PyTorch)

### 4.4 Inspecting Candidate Resumes, Test Scores & AI Interview Decisions
* View the applicant's verified resume.
* Review their score and accuracy on the adaptive skill assessment.
* Review the AI interview evaluation report and strengths/concerns breakdown.
* Issue an **Offer** directly through the recruitment portal.

---

## 5. Understanding the AI Agents & Scoring Logic

The platform uses an ensemble of 8 specialized agents designed for recruitment:

```text
┌───────────────────────────────┐        ┌───────────────────────────────┐
│     Resume Analysis Agent     │        │       JD Analysis Agent       │
│  • Parses text & skill trees  │        │  • Extracts technical stack   │
│  • Computes Quality Score     │        │  • Identifies eligibility     │
└───────────────┬───────────────┘        └───────────────┬───────────────┘
                │                                        │
                ↓                                        ↓
         MongoDB + ChromaDB                       MongoDB + ChromaDB
                │                                        │
                └───────────────────┬────────────────────┘
                                    ↓
                 ┌───────────────────────────────────────┐
                 │        Hybrid Matching Agent          │
                 │   0.3*Semantic + 0.4*SkillOverlap     │
                 │   + 0.2*Eligibility + 0.1*Experience  │
                 └──────────────────┬────────────────────┘
                                    ↓
                 ┌───────────────────────────────────────┐
                 │       Adaptive Assessment Agent       │
                 │      Dynamic Item Response Theory     │
                 └──────────────────┬────────────────────┘
                                    ↓
                 ┌───────────────────────────────────────┐
                 │          AI Interview Agent           │
                 │       Multi-turn Probing & Context    │
                 └──────────────────┬────────────────────┘
                                    ↓
                 ┌───────────────────────────────────────┐
                 │       Interview Evaluation Agent      │
                 │        5-Pillar Decision Rubric       │
                 └──────────────────┬────────────────────┘
                                    ↓
                 ┌───────────────────────────────────────┐
                 │         Skill Gap Analysis Agent      │
                 │       Personalized Remediation Plan   │
                 └───────────────────────────────────────┘
```

### Hybrid Scoring Formula
To avoid the hallucination and semantic drift risks of vector-only matching, the platform enforces a **4-pillar hybrid formula**:

$$\text{Final Score} = (0.30 \times \text{Semantic}) + (0.40 \times \text{Skill Overlap}) + (0.20 \times \text{Eligibility}) + (0.10 \times \text{Experience})$$

* **Semantic Match (30%)**: Cosine similarity between candidate and job embeddings computed via ChromaDB.
* **Skill Overlap (40%)**: Hard token matching between candidate skills and mandatory job requirements.
* **Eligibility (20%)**: Boolean verification against minimum academic CGPA.
* **Experience (10%)**: Internship, project duration, and portfolio relevance.

---

## 6. Responsible AI, Transparency & Compliance

1. **No Demographic Bias**: The matching algorithms strictly exclude protected characteristics (Gender, Race, Religion, Caste, Disability, Location) from all scoring algorithms.
2. **Explainable Recommendations**: Every score provides textual citations explaining *why* a candidate was recommended and highlights any missing competencies.
3. **Human-in-the-Loop Oversight**: AI recommendations serve as decision support; Placement Officers and Recruiters retain final authorization over all shortlisting and hiring actions.
4. **Audit Trail**: Every AI decision links to an execution record in MongoDB `agent_runs` logging the exact prompt, model, timestamp, and retrieval context.

---

## 7. Frequently Asked Questions (FAQ)

#### Q: Where are files stored?
* **PostgreSQL** stores relational data (users, jobs, applications, test scores).
* **MongoDB** stores rich documents (parsed resumes, full JDs, interview transcripts).
* **ChromaDB** stores dense vector embeddings for semantic search.
* Resume PDFs are stored securely on the filesystem under `/uploads/resumes/`.

#### Q: How do I change my password?
Navigate to your profile page (`/student/profile` or `/admin/dashboard`) to update account credentials.

#### Q: What if an external AI API is offline or has no credit?
The system includes an automatic offline heuristic engine. If external Gemini/OpenAI API keys are absent or unreachable, the platform seamlessly synthesizes structured assessments, evaluations, and match scores without crashing.

#### Q: Can an administrator manually override an AI recommendation?
Yes. On the `/admin/candidates` screen, an administrator can click on any candidate and change their status from `REJECTED` or `APPLIED` to `SHORTLISTED` or `OFFERED`, with administrative notes logged in the audit trail.
