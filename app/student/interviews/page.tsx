import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, ArrowRight, Award, CheckCircle2 } from "lucide-react";

export default async function StudentInterviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sessions = await prisma.interviewSession.findMany({
    where: { student: { userId: user.id } },
    include: {
      application: {
        include: {
          job: { include: { company: true } },
        },
      },
      evaluation: true,
    },
    orderBy: { scheduledAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          AI Technical Interview Sessions
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Simulated technical and behavioral interviews powered by the Adaptive Interview Agent and multi-pillar rubric scoring.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session) => {
          const isCompleted = session.status === "COMPLETED";
          const evalResult = session.evaluation;

          return (
            <Card key={session.id} className="flex flex-col justify-between hover:border-blue-300 transition-all shadow-sm">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-semibold">
                    {session.application.job.company.name}
                  </Badge>
                  <Badge
                    variant={
                      session.status === "COMPLETED"
                        ? "success"
                        : session.status === "IN_PROGRESS"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[10px] uppercase"
                  >
                    {session.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {session.application.job.title}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Scheduled:{" "}
                  {new Date(session.scheduledAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs">
                {evalResult ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">Evaluation Score:</span>
                      <span className="text-lg font-extrabold text-blue-600">{evalResult.overallScore}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                      <div>Tech Depth: <strong>{evalResult.technicalScore}%</strong></div>
                      <div>Problem Solving: <strong>{evalResult.problemSolvingScore}%</strong></div>
                      <div>Communication: <strong>{evalResult.communicationScore}%</strong></div>
                      <div>Decision: <strong className="text-blue-600">{evalResult.decision}</strong></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Interactive technical interview covering systems architecture, algorithm trade-offs, and behavioral scenarios.
                  </p>
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t">
                <Link href={`/student/interviews/${session.id}`} className="w-full">
                  <Button
                    size="sm"
                    className={`w-full text-xs gap-1.5 ${
                      isCompleted
                        ? "bg-slate-800 hover:bg-slate-900 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" />
                    {isCompleted ? "Review Interview Transcript" : "Enter Live AI Interview Room"}
                    <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
