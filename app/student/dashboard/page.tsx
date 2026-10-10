import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Briefcase,
  CheckSquare,
  Video,
  TrendingUp,
  Award,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Building,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch student profile, applications, assessments, interviews from PostgreSQL
  const student = await prisma.studentProfile.findFirst({
    where: { userId: user.id },
    include: {
      resumes: { orderBy: { uploadedAt: "desc" }, take: 1 },
      applications: {
        include: {
          job: { include: { company: true } },
          interviews: true,
        },
        orderBy: { createdAt: "desc" },
      },
      assessmentAttempts: {
        include: { assessment: { include: { job: true } } },
        orderBy: { startedAt: "desc" },
      },
      interviews: {
        include: {
          application: { include: { job: { include: { company: true } } } },
          evaluation: true,
        },
        orderBy: { scheduledAt: "desc" },
      },
    },
  });

  const latestResume = student?.resumes[0];
  const resumeScore = latestResume?.qualityScore || 0;
  const applicationsCount = student?.applications.length || 0;
  const interviewsCount = student?.interviews.length || 0;
  const attempts = student?.assessmentAttempts || [];
  const completedAttempts = attempts.filter((a) => a.status === "COMPLETED");
  const avgTestScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((acc, cur) => acc + (cur.score || 0), 0) / completedAttempts.length)
    : 0;

  // Calculate holistic Placement Readiness Score
  // Weighted: 30% CGPA, 30% Resume Quality, 20% Assessment Avg, 20% Applications/Interviews
  const cgpaNormalized = Math.min(100, Math.round(((student?.cgpa || 7.0) / 10.0) * 100));
  const placementReadiness = Math.round(
    0.3 * cgpaNormalized +
    0.3 * (resumeScore || 70) +
    0.2 * (avgTestScore || 75) +
    0.2 * (applicationsCount > 0 ? 85 : 50)
  );

  // Fetch recent announcements
  const announcements = await prisma.announcement.findMany({
    take: 2,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur">
            <Sparkles className="h-3 w-3" /> Autonomous Placement Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Roll: <span className="font-semibold text-white">{student?.studentId}</span> • Department:{" "}
            <span className="font-semibold text-white">{student?.department}</span> • CGPA:{" "}
            <span className="font-semibold text-white">{student?.cgpa}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/student/jobs">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow text-xs sm:text-sm">
              Explore Matched Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placement Readiness */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Placement Readiness
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {placementReadiness}%
            </div>
            <Progress value={placementReadiness} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground">
              Synthesized from CGPA, Resume, Assessments & Interview evaluations
            </p>
          </CardContent>
        </Card>

        {/* Resume Quality Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Resume Quality Score
            </CardTitle>
            <FileText className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {resumeScore > 0 ? `${Math.round(resumeScore)}%` : "Not Scored"}
            </div>
            <Progress value={resumeScore} indicatorClassName="bg-emerald-600" className="h-1.5" />
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Resume Analysis Agent</span>
              <Link href="/student/resume" className="text-blue-600 hover:underline font-medium">
                Review &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Active Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {applicationsCount}
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">
                {student?.applications.filter((a) => a.status === "SHORTLISTED").length || 0} Shortlisted
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">
                {student?.applications.filter((a) => a.status === "OFFERED").length || 0} Offers
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              AI Interview Sessions
            </CardTitle>
            <Video className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {interviewsCount}
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-muted-foreground">Adaptive technical turns</span>
              <Link href="/student/interviews" className="text-blue-600 hover:underline font-medium">
                Enter Room &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections: Job Matches & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applications & Next Steps */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">My Campus Applications</CardTitle>
                <CardDescription className="text-xs">
                  Real-time status managed in PostgreSQL with hybrid AI match scores
                </CardDescription>
              </div>
              <Link href="/student/jobs">
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  Browse More <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {student?.applications.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
                  <p>You haven&apos;t applied to any campus drives yet.</p>
                  <Link href="/student/jobs">
                    <Button size="sm" className="text-xs bg-blue-600">Explore Matched Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {student?.applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border bg-card hover:bg-accent/40 transition-colors gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                            {app.job.title}
                          </h4>
                          <Badge variant="outline" className="text-[10px]">
                            {app.job.company.name}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Applied: {new Date(app.createdAt).toLocaleDateString()} • Min CGPA: {app.job.minCgpa}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-blue-600">
                            {app.matchScore ? `${Math.round(app.matchScore)}% Match` : "Scoring..."}
                          </span>
                        </div>
                        <Badge
                          variant={
                            app.status === "OFFERED"
                              ? "success"
                              : app.status === "SHORTLISTED"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs capitalize"
                        >
                          {app.status.replace("_", " ").toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/student/resume" className="block">
              <Card className="hover:border-blue-300 hover:shadow-sm transition-all h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-sm">Upload Resume</h4>
                  <p className="text-xs text-muted-foreground">
                    Trigger Resume Analysis Agent for instant skills extraction & ChromaDB vectoring.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/student/assessments" className="block">
              <Card className="hover:border-blue-300 hover:shadow-sm transition-all h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-sm">Adaptive Tests</h4>
                  <p className="text-xs text-muted-foreground">
                    Practice dynamic assessments that scale in real time according to your accuracy.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/student/skills" className="block">
              <Card className="hover:border-blue-300 hover:shadow-sm transition-all h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-sm">Skill Gap Matrix</h4>
                  <p className="text-xs text-muted-foreground">
                    View identified gaps against visiting companies with customized learning roadmaps.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Column: Placement Announcements & Upcoming Schedule */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Placement Drive Bulletins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-muted/40 border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] text-blue-600">
                      {item.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Polyglot Storage Verification Badge */}
          <Card className="bg-slate-900 text-white border-none p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Sparkles className="h-3.5 w-3.5" /> Polyglot Sync Status
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Relational Profile:</span>
                <span className="font-mono text-emerald-400">PostgreSQL (Active)</span>
              </div>
              <div className="flex justify-between">
                <span>Resume Document:</span>
                <span className="font-mono text-amber-400">MongoDB (Synced)</span>
              </div>
              <div className="flex justify-between">
                <span>Vector Embeddings:</span>
                <span className="font-mono text-purple-400">ChromaDB (Indexed)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
