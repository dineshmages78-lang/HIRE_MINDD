import { getCurrentUser } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";
import { getMongoCollection, COLLECTIONS } from "@/lib/db/mongodb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, CheckCircle2, XCircle, Clock, Database, Layers } from "lucide-react";

export default async function AdminAgentLogsPage() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("RECRUITER"))) {
    redirect("/login");
  }

  // Fetch Agent Runs from MongoDB
  const col = await getMongoCollection(COLLECTIONS.AGENT_RUNS);
  const rawRuns = await col.find({}).sort({ createdAt: -1 }).limit(30).toArray();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Cpu className="h-6 w-6 text-purple-600" />
          AI Agent Execution Audit & Transparency
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Every autonomous AI agent run is transparently logged in MongoDB with model parameters, retrieval provenance, and runtime latency.
        </p>
      </div>

      {/* Polyglot Notice */}
      <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 text-xs flex items-center gap-2 text-purple-900 dark:text-purple-200">
        <Layers className="h-4 w-4 text-purple-600 shrink-0" />
        <span>
          <strong>MongoDB Collection:</strong> <code>agent_runs</code> stores structured JSON execution telemetry demonstrating verified agentic behavior.
        </span>
      </div>

      <div className="space-y-4">
        {rawRuns.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            No agent runs logged yet. Execute resume analysis, candidate matching, or interview evaluations to populate.
          </Card>
        ) : (
          rawRuns.map((run: any, idx: number) => {
            const isSuccess = run.status === "completed";
            const durationMs = run.completedAt && run.startedAt
              ? new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()
              : null;

            return (
              <Card key={idx} className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/40 py-3 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-purple-700 dark:text-purple-300">
                        {run.agent}
                      </span>
                      <Badge
                        variant={isSuccess ? "success" : "destructive"}
                        className="text-[10px] uppercase font-bold"
                      >
                        {run.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        Model: {run.model || "gemini-1.5-flash"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {durationMs !== null && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" /> {durationMs}ms
                        </span>
                      )}
                      <span>{new Date(run.startedAt || run.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase font-sans font-semibold">
                        Target Entity ID:
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 break-all">{run.entityId}</span>
                    </div>

                    {run.retrievalSources && (
                      <div>
                        <span className="text-[10px] text-muted-foreground block uppercase font-sans font-semibold">
                          ChromaDB Retrieval Provenance:
                        </span>
                        <span className="text-blue-600 break-all">{JSON.stringify(run.retrievalSources)}</span>
                      </div>
                    )}
                  </div>

                  {run.result && (
                    <div className="pt-2 border-t">
                      <span className="text-[10px] text-muted-foreground block uppercase font-sans font-semibold mb-1">
                        Agent Structured Output Snapshot:
                      </span>
                      <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[11px] overflow-x-auto">
                        {JSON.stringify(run.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {run.error && (
                    <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-[11px]">
                      <strong>Error:</strong> {run.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
