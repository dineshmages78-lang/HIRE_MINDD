"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  Building,
  MapPin,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [matchingJobId, setMatchingJobId] = useState<string | null>(null);
  const [matchResults, setMatchResults] = useState<Record<string, any>>({});
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
    } catch (e) {
      console.error("Failed to load jobs", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (data.applications) {
        const appliedSet = new Set<string>(data.applications.map((a: any) => a.jobId));
        setAppliedJobs(appliedSet);
      }
    } catch (e) {}
  };

  const handleRunAiMatch = async (jobId: string) => {
    setMatchingJobId(jobId);
    try {
      // Get current user profile
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (!userData.user?.studentProfileId) {
        alert("Please log in as a student to evaluate matching.");
        return;
      }

      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: userData.user.studentProfileId,
          jobId,
        }),
      });

      const data = await res.json();
      if (data.matchResult) {
        setMatchResults((prev) => ({ ...prev, [jobId]: data.matchResult }));
      }
    } catch (e) {
      console.error("Match calculation error", e);
    } finally {
      setMatchingJobId(null);
    }
  };

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to apply");
      }

      setAppliedJobs((prev) => new Set([...Array.from(prev), jobId]));
      if (data.matchResult) {
        setMatchResults((prev) => ({ ...prev, [jobId]: data.matchResult }));
      }
      setStatusMessage(`Application submitted successfully to ${data.application?.job?.title}! Match Score: ${data.matchResult?.overallMatchScore}%`);
    } catch (err: any) {
      alert(err.message || "Failed to apply");
    } finally {
      setApplyingJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Active Campus Placement Drives
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Explore campus recruitment postings with on-demand hybrid AI matching (semantic retrieval + skill overlap + academic eligibility).
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Jobs Listing */}
      <div className="space-y-6">
        {jobs.map((job) => {
          const isApplied = appliedJobs.has(job.id);
          const match = matchResults[job.id];
          const isMatching = matchingJobId === job.id;
          const isApplying = applyingJobId === job.id;

          return (
            <Card key={job.id} className="overflow-hidden border shadow-sm hover:border-blue-200 transition-all">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/40 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {job.title}
                      </h3>
                      <Badge variant="outline" className="bg-white dark:bg-slate-800 text-xs font-semibold">
                        {job.company.name}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {job.employmentType}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" /> Min CGPA: {job.minCgpa}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Top Match Score Badge if evaluated */}
                  {match && (
                    <div className="sm:text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        <span className="font-bold text-sm text-blue-700 dark:text-blue-300">
                          {match.overallMatchScore}% Match
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Recommendation: <strong>{match.recommendation}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* AI Summary & Description */}
                {job.aiSummary && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {job.aiSummary}
                  </p>
                )}

                {/* Required Skills Badges */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Required Technical Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requirements?.technicalSkills?.map((skill: string, idx: number) => {
                      const isMatched = match?.matchedSkills?.includes(skill);
                      const isMissing = match?.missingSkills?.includes(skill);
                      return (
                        <Badge
                          key={idx}
                          variant={isMatched ? "success" : isMissing ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {skill}
                          {isMatched && " ✓"}
                          {isMissing && " ✗"}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Hybrid Match Factor Breakdown (If evaluated) */}
                {match && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <Sparkles className="h-3.5 w-3.5" /> Hybrid Match Explainability Breakdown
                      </span>
                      <span className="text-[11px] text-muted-foreground">Responsible AI Decision Support</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-2 rounded bg-background border">
                        <div className="text-[10px] text-muted-foreground">Semantic Similarity (30%)</div>
                        <div className="font-bold text-sm text-purple-600">{match.factors.semanticScore}%</div>
                      </div>
                      <div className="p-2 rounded bg-background border">
                        <div className="text-[10px] text-muted-foreground">Skill Overlap (40%)</div>
                        <div className="font-bold text-sm text-blue-600">{match.factors.skillScore}%</div>
                      </div>
                      <div className="p-2 rounded bg-background border">
                        <div className="text-[10px] text-muted-foreground">Academic Cutoff (20%)</div>
                        <div className="font-bold text-sm text-emerald-600">{match.factors.eligibilityScore}%</div>
                      </div>
                      <div className="p-2 rounded bg-background border">
                        <div className="text-[10px] text-muted-foreground">Experience Match (10%)</div>
                        <div className="font-bold text-sm text-amber-600">{match.factors.experienceScore}%</div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong>AI Evidence:</strong> {match.evidenceAndExplanation}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="bg-slate-50/50 dark:bg-slate-900/20 border-t flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunAiMatch(job.id)}
                    disabled={isMatching}
                    className="text-xs gap-1.5"
                  >
                    {isMatching ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Matching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        {match ? "Recalculate AI Match" : "Calculate AI Match Score"}
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {isApplied ? (
                    <Badge variant="success" className="text-xs py-1 px-3">
                      ✓ Application Submitted
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleApply(job.id)}
                      disabled={isApplying}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
                        </>
                      ) : (
                        "Apply with Resume"
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
