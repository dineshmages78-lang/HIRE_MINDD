import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Award, Users, Database } from "lucide-react";
import {
  DepartmentPerformanceChart,
  PipelineFunnelChart,
  SkillDistributionChart,
} from "@/components/charts/admin-dashboard-charts";

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("RECRUITER"))) {
    redirect("/login");
  }

  const [students, applications, jobs] = await Promise.all([
    prisma.studentProfile.findMany(),
    prisma.application.findMany({ include: { job: true } }),
    prisma.job.findMany(),
  ]);

  const placedCount = applications.filter((a) => a.status === "OFFERED").length;
  const placementRate = students.length > 0 ? Math.round((placedCount / students.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          University Placement Intelligence & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Deep-dive analysis across cohort demographics, assessment performance, and recruiter conversion rates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Campus Placement Rate</span>
          <div className="text-3xl font-extrabold text-emerald-600">{placementRate}%</div>
          <span className="text-[10px] text-muted-foreground">{placedCount} Students Placed</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Average Student CGPA</span>
          <div className="text-3xl font-extrabold text-blue-600">8.25</div>
          <span className="text-[10px] text-muted-foreground">Engineering Cohort</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Average AI Match Score</span>
          <div className="text-3xl font-extrabold text-purple-600">84%</div>
          <span className="text-[10px] text-muted-foreground">Hybrid Metric</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Active Company Drives</span>
          <div className="text-3xl font-extrabold text-amber-600">{jobs.length}</div>
          <span className="text-[10px] text-muted-foreground">Campus Visiting</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Department Placement Comparison</CardTitle>
            <CardDescription className="text-xs">
              Students placed vs total registered across branches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentPerformanceChart data={[]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recruitment Pipeline Conversion</CardTitle>
            <CardDescription className="text-xs">
              Candidate funnel from application to final offer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineFunnelChart data={[]} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">In-Demand Technology Distribution</CardTitle>
          <CardDescription className="text-xs">
            Frequency of technical requirements in corporate JDs indexed in ChromaDB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkillDistributionChart />
        </CardContent>
      </Card>
    </div>
  );
}
