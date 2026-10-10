import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Plus } from "lucide-react";

export default async function AdminAnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user || !user.roles.includes("ADMIN")) {
    redirect("/login");
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Bell className="h-6 w-6 text-blue-600" />
          Campus Placement Announcements ({announcements.length})
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Broadcast bulletins, drive schedules, and placement guidelines to students.
        </p>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <Card key={ann.id} className="border shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/40 pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold text-blue-600">
                    {ann.category}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    Audience: {ann.targetAudience}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {ann.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs text-muted-foreground leading-relaxed">
              {ann.content}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
