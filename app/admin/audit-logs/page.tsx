import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Database, Clock } from "lucide-react";

export default async function AdminAuditLogsPage() {
  const user = await getCurrentUser();
  if (!user || !user.roles.includes("ADMIN")) {
    redirect("/login");
  }

  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <ShieldAlert className="h-6 w-6 text-blue-600" />
          Enterprise Security & Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Immutable audit records persisted in PostgreSQL capturing user actions, admin overrides, and AI pipeline events.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Audit Trail ({logs.length} Events)</CardTitle>
            <Badge variant="outline" className="text-xs">PostgreSQL audit_logs</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground font-sans text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-white">
                      {log.user ? `${log.user.firstName} (${log.user.email})` : "System / AI"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-bold text-[10px] text-blue-600">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{log.entityType}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {log.entityId ? log.entityId.substring(0, 10) + "..." : "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{log.ipAddress || "127.0.0.1"}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-muted-foreground">
                      {log.details || "—"}
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
