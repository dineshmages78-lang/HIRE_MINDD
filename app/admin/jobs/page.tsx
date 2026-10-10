"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Sparkles,
  Building,
  Plus,
  Loader2,
  CheckCircle2,
  Calendar,
  Layers,
  Cpu,
  Database,
} from "lucide-react";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    companyId: "",
    title: "",
    department: "Software Engineering",
    location: "Bengaluru, India (Hybrid)",
    minCgpa: "7.0",
    deadlineDays: "30",
    rawJdText: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        // Extract unique companies
        const compList = Array.from(
          new Map(data.jobs.map((j: any) => [j.company.id, j.company])).values()
        );
        setCompanies(compList);
        if (compList.length > 0 && !formData.companyId) {
          setFormData((prev) => ({ ...prev, companyId: (compList[0] as any).id }));
        }
      }
    } catch (e) {
      console.error("Failed to load jobs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      setShowCreateModal(false);
      setFormData({
        companyId: companies[0]?.id || "",
        title: "",
        department: "Software Engineering",
        location: "Bengaluru, India (Hybrid)",
        minCgpa: "7.0",
        deadlineDays: "30",
        rawJdText: "",
      });
      fetchJobs();
    } catch (err: any) {
      alert(err.message || "Error creating job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillSampleJD = () => {
    setFormData((prev) => ({
      ...prev,
      title: "Full Stack AI Platform Engineer",
      rawJdText: `
Job Title: Full Stack AI Platform Engineer
Department: Applied AI & Cloud Systems
Company: ABC Tech Innovations

Role Overview:
We are seeking an enthusiastic engineering graduate to join our core AI engineering group. You will build high-concurrency microservices, design scalable APIs, and integrate LLM agents with relational and vector databases.

Key Requirements:
- Hands-on proficiency in Python, TypeScript, React, and Node.js.
- Strong knowledge of relational databases (PostgreSQL) and NoSQL stores (MongoDB).
- Experience with vector retrieval systems (ChromaDB / Pinecone) is highly desirable.
- Basic understanding of containerization (Docker) and CI/CD pipelines.
- Solid understanding of Data Structures, Algorithms, and Object-Oriented Design.

Eligibility:
- Degree: B.Tech / M.Tech in Computer Science, IT, or related field.
- Minimum CGPA: 7.2 / 10.0
- Graduation Batch: 2025
`.trim(),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Job Postings & JD Analysis Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Publish recruitment opportunities. The JD Analysis Agent extracts technical skills and indexes vectors into ChromaDB automatically.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {showCreateModal ? "Close Creator" : "Post New Job with JD Agent"}
        </Button>
      </div>

      {/* Create Job Drawer / Panel */}
      {showCreateModal && (
        <Card className="border-2 border-blue-500 shadow-md">
          <form onSubmit={handleCreateJob}>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/40 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    New Job Description & Autonomous Vectorization
                  </CardTitle>
                  <CardDescription className="text-xs">
                    PostgreSQL stores the relational Job entity. MongoDB stores structured requirements. ChromaDB indexes semantic vectors.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFillSampleJD}
                  className="text-xs"
                >
                  Load Sample Job Spec
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="companyId">Corporate Partner</Label>
                  <select
                    id="companyId"
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Associate Software Engineer"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="location">Work Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="minCgpa">Minimum CGPA Cutoff</Label>
                  <Input
                    id="minCgpa"
                    type="number"
                    step="0.1"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deadlineDays">Application Window (Days)</Label>
                  <Input
                    id="deadlineDays"
                    type="number"
                    value={formData.deadlineDays}
                    onChange={(e) => setFormData({ ...formData, deadlineDays: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rawJdText">Raw Job Description Text (For JD Analysis Agent)</Label>
                  <span className="text-muted-foreground text-[11px] font-mono">
                    {formData.rawJdText.length} chars
                  </span>
                </div>
                <textarea
                  id="rawJdText"
                  rows={8}
                  value={formData.rawJdText}
                  onChange={(e) => setFormData({ ...formData, rawJdText: e.target.value })}
                  placeholder="Paste full job description text here to trigger automatic skill extraction and vector generation..."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing JD Analysis Agent & Vector Indexing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Save to PostgreSQL, MongoDB & Index ChromaDB
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="overflow-hidden border shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/40 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {job.title}
                    </h3>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {job.company.name}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Department: {job.department} • Location: {job.location} • Min CGPA: {job.minCgpa}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                  <span>{job._count?.applications || 0} Applicants</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              {job.aiSummary && (
                <p className="text-muted-foreground leading-relaxed">
                  {job.aiSummary}
                </p>
              )}

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Extracted Requirements (MongoDB)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements?.technicalSkills?.map((s: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[11px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Polyglot reference status */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground pt-2 border-t font-mono">
                <span>PostgreSQL ID: {job.id.substring(0, 12)}...</span>
                <span>MongoDB: job_descriptions synced ✓</span>
                <span>ChromaDB: job_embeddings indexed ✓</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
