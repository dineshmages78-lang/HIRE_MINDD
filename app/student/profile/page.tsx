import { getCurrentUser } from "@/lib/auth/auth-utils";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Mail, Phone, MapPin, Building, Calendar, Award } from "lucide-react";

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const student = await prisma.studentProfile.findFirst({
    where: { userId: user.id },
    include: { user: true },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Student Academic Profile
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Relational student record persisted in PostgreSQL and synchronized with AI screening agents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Summary */}
        <Card className="p-6 text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-md">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{student?.studentId}</p>
            <Badge variant="outline" className="mt-2 text-xs bg-blue-50 text-blue-700">
              {student?.placed ? "Placement Secured ✓" : "Actively Seeking Placement"}
            </Badge>
          </div>

          <div className="pt-4 border-t text-xs text-left space-y-2.5 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-blue-600" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-blue-600" />
              <span>{student?.college}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>{student?.location || "India"}</span>
            </div>
          </div>
        </Card>

        {/* Right Details Grid */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Academic Credentials</CardTitle>
              <CardDescription className="text-xs">
                Verified university credentials used for eligibility matching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <span className="text-muted-foreground block text-[11px]">Degree Program</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{student?.degree}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <span className="text-muted-foreground block text-[11px]">Department / Branch</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{student?.department}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <span className="text-muted-foreground block text-[11px]">Current CGPA</span>
                  <span className="font-bold text-sm text-emerald-600">{student?.cgpa} / 10.0</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <span className="text-muted-foreground block text-[11px]">Graduation Year</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{student?.graduationYear}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 text-xs space-y-1 text-muted-foreground">
                <span className="font-semibold text-blue-900 dark:text-blue-200 block">
                  Eligibility Safeguard Notice
                </span>
                <p>
                  Your CGPA and degree credentials are validated against visiting company minimum criteria in PostgreSQL.
                  AI matching weights academic eligibility at 20% to prevent unfair disqualification.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
