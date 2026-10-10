import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, Mail, Phone, MapPin } from "lucide-react";

export default async function AdminStudentsPage() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("RECRUITER"))) {
    redirect("/login");
  }

  const students = await prisma.studentProfile.findMany({
    include: {
      user: true,
      resumes: { orderBy: { uploadedAt: "desc" }, take: 1 },
      _count: { select: { applications: true, assessmentAttempts: true } },
    },
    orderBy: { cgpa: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Users className="h-6 w-6 text-blue-600" />
          University Student Roster ({students.length})
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Registered students with verified academic profiles and resume screening status.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Student ID / Name</th>
                  <th className="py-3 px-4">Department & Degree</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Resume Status</th>
                  <th className="py-3 px-4">Applications</th>
                  <th className="py-3 px-4">Placement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((st) => {
                  const resume = st.resumes[0];
                  return (
                    <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {st.user.firstName} {st.user.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {st.studentId} • {st.user.email}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {st.department}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">{st.degree}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-sm text-emerald-600">{st.cgpa}</span>
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">{st.graduationYear}</td>

                      <td className="py-3 px-4">
                        {resume ? (
                          <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-50 border-blue-200">
                            Score: {resume.qualityScore ? `${Math.round(resume.qualityScore)}%` : "Parsed"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">No Resume</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-semibold text-blue-600">
                        {st._count.applications} Applied
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={st.placed ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {st.placed ? "Placed ✓" : "Seeking"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
