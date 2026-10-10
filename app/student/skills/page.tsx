"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Target,
} from "lucide-react";

export default function StudentSkillsPage() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [report, setReport] = useState<any>(null);
  const [studentId, setStudentId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (userData.user?.studentProfileId) {
        setStudentId(userData.user.studentProfileId);
      }

      const jobsRes = await fetch("/api/jobs");
      const jobsData = await jobsRes.json();
      if (jobsData.jobs && jobsData.jobs.length > 0) {
        setJobs(jobsData.jobs);
        setSelectedJobId(jobsData.jobs[0].id);
        // Automatically run initial skill gap analysis for first job
        fetchSkillGap(userData.user?.studentProfileId, jobsData.jobs[0].id);
      }
    } catch (e) {
      console.error("Failed to load skills page data", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillGap = async (stId: string, jId: string) => {
    if (!stId || !jId) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: stId, jobId: jId }),
      });
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      }
    } catch (e) {
      console.error("Failed to fetch skill gap", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleJobChange = (newJobId: string) => {
    setSelectedJobId(newJobId);
    fetchSkillGap(studentId, newJobId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Skill Gap Matrix & Learning Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Autonomous Skill Gap Agent comparing your resume, test scores, and interview performance against target corporate roles.
          </p>
        </div>

        {/* Target Job Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0 font-medium">Target Role:</span>
          <select
            value={selectedJobId}
            onChange={(e) => handleJobChange(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.company?.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {analyzing ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs text-muted-foreground">
            Skill Gap Agent is cross-referencing requirements, assessment attempts, and interview evaluation...
          </p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Top Readiness Score Card */}
          <Card className="border-t-4 border-t-blue-600 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Role Placement Readiness</CardTitle>
                  <CardDescription className="text-xs">
                    Holistic qualification assessment for selected campus job
                  </CardDescription>
                </div>
                <div className="text-3xl font-extrabold text-blue-600">
                  {report.overallReadinessScore}%
                </div>
              </div>
              <Progress value={report.overallReadinessScore} className="h-2 mt-2" />
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {report.summary}
              </p>
            </CardContent>
          </Card>

          {/* Skill Gap Matrix Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Domain Competencies & Gap Severity Matrix</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  ChromaDB Skill Vectors Indexed
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Skill / Competency</th>
                      <th className="py-2.5 px-3">Required Level</th>
                      <th className="py-2.5 px-3">Current Level</th>
                      <th className="py-2.5 px-3">Gap Severity</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Actionable Next Step</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {report.gaps?.map((item: any, idx: number) => {
                      const isCritical = item.gapSeverity === "Critical" || item.gapSeverity === "High";
                      return (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                            {item.skill}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">{item.requiredLevel}</td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {item.currentLevel}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={
                                item.gapSeverity === "None"
                                  ? "success"
                                  : isCritical
                                  ? "destructive"
                                  : "warning"
                              }
                              className="text-[10px]"
                            >
                              {item.gapSeverity}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`font-semibold ${
                                item.priority === "Critical"
                                  ? "text-red-600"
                                  : item.priority === "High"
                                  ? "text-amber-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground max-w-xs">
                            {item.recommendedActions?.[0] || "Review advanced documentation"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Learning Roadmap */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Tailored Multi-Phase Upskilling Roadmap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.learningRoadmap?.map((phase: any, idx: number) => (
                <Card key={idx} className="border shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] text-blue-600">
                        {phase.timeline}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400">Phase {idx + 1}</span>
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {phase.phase}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                        Key Study Topics:
                      </span>
                      <ul className="mt-1 space-y-1 text-slate-700 dark:text-slate-300">
                        {phase.topics?.map((topic: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-blue-600" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                      <span className="font-semibold text-blue-900 dark:text-blue-200 block text-[11px]">
                        Hands-On Project Exercise:
                      </span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {phase.projectIdea}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          No skill gap data available yet. Select a target job to trigger the Skill Gap Agent.
        </Card>
      )}
    </div>
  );
}
