import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Users, Video, Award, Building } from "lucide-react";

export default async function RecruiterDashboardPage() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("RECRUITER") && !user.roles.includes("ADMIN"))) {
    redirect("/login");
  }

  const company = user.companyId
    ? await prisma.company.findUnique({ where: { id: user.companyId } })
    : await prisma.company.findFirst();

  const jobs = company
    ? await prisma.job.findMany({
        where: { companyId: company.id },
        include: {
          applications: {
            include: { student: { include: { user: true } } },
          },
        },
      })
    : [];

  const totalApplicants = jobs.reduce((acc, j) => acc + j.applications.length, 0);
  const shortlisted = jobs.reduce(
    (acc, j) => acc + j.applications.filter((a) => a.status === "SHORTLISTED" || a.status === "OFFERED").length,
    0
  );

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg">
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs bg-white/10 text-blue-300 border-white/20">
            Corporate Campus Recruiter Console
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {company?.name || "Corporate Partner"} Hiring Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Welcome, {user.firstName} {user.lastName}! Monitor applicant match scores and review AI interview evaluations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Active Postings</span>
          <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Total Applicants</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalApplicants}</div>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">AI Shortlisted</span>
          <div className="text-2xl font-bold text-emerald-600">{shortlisted}</div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Postings & Talent Pipeline</h2>
          <Link href="/admin/jobs">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
              Manage Postings
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="border shadow-sm">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    {job.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs text-blue-600">
                    {job.applications.length} Candidates
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Location: {job.location} • Min CGPA: {job.minCgpa}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-2 pt-1">
                  {job.applications.slice(0, 4).map((app) => (
                    <Badge key={app.id} variant="secondary" className="text-[10px]">
                      {app.student.user.firstName} {app.student.user.lastName} ({Math.round(app.matchScore || 0)}%)
                    </Badge>
                  ))}
                  {job.applications.length > 4 && (
                    <span className="text-[10px] text-muted-foreground">+{job.applications.length - 4} more</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
