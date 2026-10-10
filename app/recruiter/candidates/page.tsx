import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles } from "lucide-react";

export default async function RecruiterCandidatesPage() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("RECRUITER") && !user.roles.includes("ADMIN"))) {
    redirect("/login");
  }

  const company = user.companyId
    ? await prisma.company.findUnique({ where: { id: user.companyId } })
    : await prisma.company.findFirst();

  const applications = company
    ? await prisma.application.findMany({
        where: { job: { companyId: company.id } },
        include: {
          student: { include: { user: true } },
          job: true,
          interviews: { include: { evaluation: true } },
        },
        orderBy: { matchScore: "desc" },
      })
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Users className="h-6 w-6 text-blue-600" />
          Applicant Match Roster ({applications.length})
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Review candidates scored and shortlisted by the Candidate Matching Agent for {company?.name}.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Applied Role</th>
                  <th className="py-3 px-4">AI Match Score</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {app.student.user.firstName} {app.student.user.lastName}
                      <span className="block text-[10px] text-muted-foreground font-mono">
                        {app.student.studentId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{app.student.department}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{app.student.cgpa}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">{app.job.title}</td>
                    <td className="py-3.5 px-4 font-bold text-sm text-blue-600">
                      {app.matchScore ? `${Math.round(app.matchScore)}%` : "N/A"}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={app.status === "OFFERED" ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {app.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
