import { getCurrentUser } from "@/lib/auth/auth-utils";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Info, AlertTriangle, Calendar } from "lucide-react";

export default async function StudentNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Notifications & Alerts
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Real-time placement alerts, shortlist updates, assessment invitations, and announcements.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600" />
            Inbox ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {notifications.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No notifications at this time.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl border bg-card hover:bg-muted/30 transition-colors flex items-start gap-3 text-xs"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  {n.type === "SUCCESS" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : n.type === "WARNING" ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{n.title}</h4>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
