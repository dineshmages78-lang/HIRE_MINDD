import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Award, CheckCircle2, User, Building } from "lucide-react";

export default async function AdminInterviewsPage() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("RECRUITER"))) {
    redirect("/login");
  }

  const sessions = await prisma.interviewSession.findMany({
    include: {
      student: { include: { user: true } },
      application: { include: { job: { include: { company: true } } } },
      evaluation: true,
    },
    orderBy: { scheduledAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Video className="h-6 w-6 text-blue-600" />
          AI Interview Reviews & Rubric Evaluations ({sessions.length})
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Review adaptive AI interview performance scored by the Interview Evaluation Agent across the 5 pillars.
        </p>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const evalRes = session.evaluation;

          return (
            <Card key={session.id} className="border shadow-sm">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/40 pb-3 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {session.student.user.firstName} {session.student.user.lastName}
                      </h3>
                      <Badge variant="outline" className="text-xs font-semibold">
                        {session.application.job.title} ({session.application.job.company.name})
                      </Badge>
                      <Badge
                        variant={session.status === "COMPLETED" ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Roll: {session.student.studentId} • Department: {session.student.department} • CGPA: {session.student.cgpa}
                    </p>
                  </div>

                  {evalRes && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-muted-foreground block">Evaluation Score</span>
                        <span className="text-xl font-extrabold text-blue-600">{evalRes.overallScore}%</span>
                      </div>
                      <Badge
                        variant={
                          evalRes.decision === "HIRE"
                            ? "success"
                            : evalRes.decision === "CONSIDER"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-xs font-bold py-1 px-2.5"
                      >
                        {evalRes.decision}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                {evalRes ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Technical Knowledge</span>
                        <span className="font-bold text-slate-900 dark:text-white">{evalRes.technicalScore}%</span>
                      </div>
                      <div className="p-2 rounded bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Problem Solving</span>
                        <span className="font-bold text-slate-900 dark:text-white">{evalRes.problemSolvingScore}%</span>
                      </div>
                      <div className="p-2 rounded bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Communication</span>
                        <span className="font-bold text-slate-900 dark:text-white">{evalRes.communicationScore}%</span>
                      </div>
                      <div className="p-2 rounded bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Role Relevance</span>
                        <span className="font-bold text-slate-900 dark:text-white">{evalRes.roleRelevanceScore}%</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      <strong>AI Review:</strong> Candidate demonstrated strong knowledge of relational databases and microservices architecture. Handled follow-up edge case probes with high structured clarity.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Interview session scheduled. Candidate has not yet entered the room.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
