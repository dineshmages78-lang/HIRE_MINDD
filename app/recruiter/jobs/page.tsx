import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users } from "lucide-react";

export default async function RecruiterJobsPage() {
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
        include: { _count: { select: { applications: true } } },
      })
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Briefcase className="h-6 w-6 text-blue-600" />
          Company Campus Job Postings ({jobs.length})
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Active job profiles published for student applications at {company?.name}.
        </p>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {job.title}
                </CardTitle>
                <Badge variant="outline" className="text-xs text-blue-600">
                  {job._count.applications} Applications
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Department: {job.department} • Location: {job.location} • Minimum CGPA: {job.minCgpa}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
              Deadline: {new Date(job.deadline).toLocaleDateString()} • Status: <span className="font-semibold text-emerald-600">{job.status}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
