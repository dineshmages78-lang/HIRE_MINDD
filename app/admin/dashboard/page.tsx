import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  CheckSquare,
  Video,
  Award,
  TrendingUp,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";
import {
  DepartmentPerformanceChart,
  PipelineFunnelChart,
  SkillDistributionChart,
} from "@/components/charts/admin-dashboard-charts";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("RECRUITER"))) {
    redirect("/login");
  }

  // Fetch metrics from PostgreSQL
  const [
    totalStudents,
    totalJobs,
    totalApplications,
    totalAssessments,
    totalInterviews,
    shortlistedCount,
    placedCount,
    companiesCount,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.assessment.count(),
    prisma.interviewSession.count(),
    prisma.application.count({ where: { status: "SHORTLISTED" } }),
    prisma.application.count({ where: { status: "OFFERED" } }),
    prisma.company.count(),
  ]);

  // Aggregate department counts from PostgreSQL
  const students = await prisma.studentProfile.findMany({
    select: { department: true, cgpa: true, placed: true },
  });

  const deptMap: Record<string, { total: number; sumCgpa: number; placed: number }> = {};
  students.forEach((s) => {
    if (!deptMap[s.department]) {
      deptMap[s.department] = { total: 0, sumCgpa: 0, placed: 0 };
    }
    deptMap[s.department].total += 1;
    deptMap[s.department].sumCgpa += s.cgpa;
    if (s.placed) deptMap[s.department].placed += 1;
  });

  const departmentData = Object.entries(deptMap).map(([dept, data]) => ({
    department: dept,
    total: data.total,
    avgCgpa: Number((data.sumCgpa / data.total).toFixed(2)),
    placed: data.placed,
  }));

  const placementRate = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg border">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-400/30">
            <ShieldCheck className="h-3 w-3 text-blue-400" /> Placement Cell Administration Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Campus Placement Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Autonomous multi-agent orchestration monitoring student screening, adaptive assessments, and recruiter pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/jobs">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Post Job with JD Agent
            </Button>
          </Link>
          <Link href="/admin/candidates">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm">
              Review AI Candidates
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Students
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalStudents}</div>
          <span className="text-[10px] text-muted-foreground">PostgreSQL Users</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Active Jobs
          </span>
          <div className="text-2xl font-bold text-blue-600">{totalJobs}</div>
          <span className="text-[10px] text-muted-foreground">Across {companiesCount} Companies</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Applications
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalApplications}</div>
          <span className="text-[10px] text-muted-foreground">Hybrid Screened</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Shortlisted
          </span>
          <div className="text-2xl font-bold text-purple-600">{shortlistedCount}</div>
          <span className="text-[10px] text-muted-foreground">AI Recommended</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Interviews
          </span>
          <div className="text-2xl font-bold text-amber-600">{totalInterviews}</div>
          <span className="text-[10px] text-muted-foreground">AI Adaptive Sessions</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Offers Placed
          </span>
          <div className="text-2xl font-bold text-emerald-600">{placedCount}</div>
          <span className="text-[10px] text-muted-foreground">{placementRate}% Campus Rate</span>
        </Card>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Placement Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Department Cohorts & Shortlist Ratio</span>
              <Badge variant="outline" className="text-[10px]">PostgreSQL Aggregate</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Comparison of total students registered vs shortlisted/placed by engineering branch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentPerformanceChart data={departmentData} />
          </CardContent>
        </Card>

        {/* Recruitment Pipeline Funnel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Placement Funnel Velocity</span>
              <Badge variant="outline" className="text-[10px] text-blue-600">Multi-Agent Funnel</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              End-to-end transition: Applications &rarr; AI Screening &rarr; Tests &rarr; Interviews &rarr; Offers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineFunnelChart data={[]} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Skill Distribution & Quick Action Centers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* In Demand Skills from ChromaDB & MongoDB */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Top Campus Technical Competencies in Visiting JDs</span>
              <Badge variant="outline" className="text-[10px] text-purple-600">ChromaDB Vectors</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Extracted by the JD Analysis Agent across active corporate postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkillDistributionChart />
          </CardContent>
        </Card>

        {/* Administration Quick Navigation */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-600" />
              Agent Transparency & Audit
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inspect every AI agent execution run in MongoDB, including model parameters, retrieval sources, and duration.
            </p>
            <Link href="/admin/agent-logs" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                Inspect Agent Runs &rarr;
              </Button>
            </Link>
          </Card>

          <Card className="p-4 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              Question Generation Agent
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate authenticated MCQ question pools with AI and approve them for live adaptive student testing.
            </p>
            <Link href="/admin/assessments" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                Manage Assessments &rarr;
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
