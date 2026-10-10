import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, ArrowRight, Award, Zap } from "lucide-react";

export default async function StudentAssessmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const assessments = await prisma.assessment.findMany({
    include: {
      job: { include: { company: true } },
      attempts: {
        where: { student: { userId: user.id } },
        orderBy: { startedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Adaptive Campus Assessments
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Technical screening assessments powered by the Adaptive Assessment Agent. Difficulty levels adapt dynamically based on your accuracy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assessments.map((test) => {
          const latestAttempt = test.attempts[0];
          const isCompleted = latestAttempt?.status === "COMPLETED";

          return (
            <Card key={test.id} className="flex flex-col justify-between hover:border-blue-300 transition-all shadow-sm">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-semibold">
                    {test.job.company.name}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{test.durationMinutes} mins</span>
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {test.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Target Role: {test.job.title}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs">
                <div className="flex items-center justify-between py-2 border-y text-muted-foreground">
                  <span>Questions Pool:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{test.totalQuestions} Questions</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Passing Cutoff:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{test.passingScore}%</span>
                </div>

                {isCompleted && (
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-between">
                    <span className="font-medium">Attempt Score:</span>
                    <span className="font-bold text-base">{latestAttempt.score}%</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t">
                <Link href={`/student/assessments/${test.id}`} className="w-full">
                  <Button
                    size="sm"
                    className={`w-full text-xs gap-1.5 ${
                      isCompleted
                        ? "bg-slate-800 hover:bg-slate-900 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {isCompleted ? "Retake Assessment" : "Launch Adaptive Test Room"}
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
