import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, Users, MapPin, Globe } from "lucide-react";

export default async function AdminCompaniesPage() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("RECRUITER"))) {
    redirect("/login");
  }

  const companies = await prisma.company.findMany({
    include: {
      recruiters: { include: { user: true } },
      jobs: { select: { id: true, title: true, status: true } },
      _count: { select: { jobs: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Building2 className="h-6 w-6 text-blue-600" />
          Corporate Placement Partners ({companies.length})
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Partner organizations visiting the university for campus hiring drives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {companies.map((comp) => (
          <Card key={comp.id} className="border shadow-sm flex flex-col justify-between">
            <CardHeader className="space-y-1.5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {comp.name}
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {comp._count.jobs} Active Jobs
                </Badge>
              </div>
              <CardDescription className="text-xs">{comp.industry}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>{comp.location}</span>
              </div>
              {comp.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <a href={comp.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    {comp.website}
                  </a>
                </div>
              )}

              <div className="pt-2 border-t space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white text-[11px] block">
                  Campus Talent Contacts:
                </span>
                {comp.recruiters.map((r) => (
                  <p key={r.id} className="text-[11px]">
                    • {r.user.firstName} {r.user.lastName} ({r.designation})
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
