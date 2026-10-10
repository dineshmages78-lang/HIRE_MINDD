"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Sparkles,
  Send,
  Loader2,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bot,
  User,
  Mic,
  MessageSquare,
} from "lucide-react";

export default function AIInterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSession();
  }, [sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initSession = async () => {
    try {
      // Start initial turn
      const res = await fetch("/api/ai/interview-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          isInitial: true,
        }),
      });

      const data = await res.json();
      if (data.interviewerMessage) {
        setMessages([
          {
            role: "assistant",
            content: data.interviewerMessage,
          },
        ]);
      }
    } catch (e) {
      console.error("Failed to start interview session", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputText;
    if (!text.trim() || isSending) return;

    const newMsgs = [...messages, { role: "user", content: text }];
    setMessages(newMsgs);
    setInputText("");
    setIsSending(true);

    try {
      const res = await fetch("/api/ai/interview-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          candidateMessage: text,
        }),
      });

      const data = await res.json();
      if (data.interviewerMessage) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.interviewerMessage }]);
      }

      if (data.isCompleted) {
        setIsCompleted(true);
        triggerEvaluation();
      }
    } catch (e) {
      console.error("Error sending response", e);
    } finally {
      setIsSending(false);
    }
  };

  const triggerEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/ai/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
      }
    } catch (e) {
      console.error("Failed to evaluate interview", e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleQuickResponse = (type: number) => {
    if (type === 1) {
      handleSendMessage("In my recent full-stack project, we designed our PostgreSQL database with composite indexes on foreign keys and created an automated cache layer using Redis. This decreased our query latency significantly during high concurrent read spikes.");
    } else if (type === 2) {
      handleSendMessage("To handle high write loads while maintaining cache consistency, we implemented an asynchronous write-behind cache with a message broker queue. We also set explicit TTLs on Redis keys to prevent stale reads.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              AI Campus Interview Room
            </h2>
            <p className="text-xs text-muted-foreground">
              Autonomous Adaptive Technical Interviewer • Multi-turn RAG context
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isCompleted ? "success" : "default"} className="text-xs">
            {isCompleted ? "Session Concluded" : "Live Session Active"}
          </Badge>
          {!isCompleted && messages.length >= 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCompleted(true);
                triggerEvaluation();
              }}
              className="text-xs"
            >
              Conclude & Evaluate
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat & Interaction Column */}
        <div className={isCompleted && evaluation ? "lg:col-span-7 space-y-4" : "lg:col-span-12 space-y-4"}>
          <Card className="h-[480px] flex flex-col justify-between border shadow-sm">
            {/* Messages Scroll Area */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {messages.map((m, idx) => {
                const isAI = m.role === "assistant";
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 text-xs sm:text-sm ${
                      isAI ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isAI && (
                      <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed ${
                        isAI
                          ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-tl-sm border"
                          : "bg-blue-600 text-white rounded-tr-sm shadow"
                      }`}
                    >
                      {m.content}
                    </div>
                    {!isAI && (
                      <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic pl-10">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  Interviewer is analyzing your response and formulating an adaptive follow-up...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Controls */}
            {!isCompleted ? (
              <div className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                {/* Sample quick response chips for fast demo interaction */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] text-muted-foreground">
                  <span className="shrink-0 font-medium">Quick Answers:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickResponse(1)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border hover:border-blue-400 shrink-0 text-left"
                  >
                    Explain Caching & SQL Indexing &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickResponse(2)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border hover:border-blue-400 shrink-0 text-left"
                  >
                    Explain Cache Invalidation Trade-offs &rarr;
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your technical response here..."
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isSending || !inputText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 h-9 px-3 gap-1"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/30 text-center text-xs text-muted-foreground font-medium">
                Interview completed. The evaluation agent has generated your report.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Live Rubric Evaluation Card (Appears upon conclusion) */}
        {isCompleted && (
          <div className="lg:col-span-5 space-y-4">
            {evaluating ? (
              <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                <h4 className="font-semibold text-sm">Evaluating Interview Performance</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Interview Evaluation Agent is analyzing transcript across 5 pillars (Technical, Problem Solving, Communication, Relevance).
                </p>
              </Card>
            ) : evaluation ? (
              <Card className="border shadow-md">
                <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Evaluation Report</CardTitle>
                      <CardDescription className="text-xs">
                        Synthesized by Interview Evaluation Agent
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        evaluation.decision === "HIRE"
                          ? "success"
                          : evaluation.decision === "CONSIDER"
                          ? "warning"
                          : "destructive"
                      }
                      className="text-xs font-bold"
                    >
                      {evaluation.decision}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4 text-xs">
                  {/* Overall Score */}
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 flex items-center justify-between">
                    <span className="font-semibold text-blue-900 dark:text-blue-200">Overall Interview Score:</span>
                    <span className="text-2xl font-extrabold text-blue-600">{evaluation.overallScore}%</span>
                  </div>

                  {/* 4 Pillars Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-muted/40 border">
                      <div className="text-muted-foreground">Technical Knowledge</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{evaluation.technicalScore}%</div>
                    </div>
                    <div className="p-2 rounded bg-muted/40 border">
                      <div className="text-muted-foreground">Problem Solving</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{evaluation.problemSolvingScore}%</div>
                    </div>
                    <div className="p-2 rounded bg-muted/40 border">
                      <div className="text-muted-foreground">Communication</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{evaluation.communicationScore}%</div>
                    </div>
                    <div className="p-2 rounded bg-muted/40 border">
                      <div className="text-muted-foreground">Role Relevance</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{evaluation.roleRelevanceScore}%</div>
                    </div>
                  </div>

                  {/* Feedback Summary */}
                  <p className="text-muted-foreground leading-relaxed">
                    {evaluation.detailedFeedback}
                  </p>

                  {/* Strengths */}
                  {evaluation.strengths?.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-semibold text-emerald-600">Demonstrated Strengths:</span>
                      {evaluation.strengths.map((s: string, i: number) => (
                        <p key={i} className="text-muted-foreground">• {s}</p>
                      ))}
                    </div>
                  )}

                  {/* Weak areas */}
                  {evaluation.weakAreas?.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-semibold text-amber-600">Areas to Deepen:</span>
                      {evaluation.weakAreas.map((w: string, i: number) => (
                        <p key={i} className="text-muted-foreground">• {w}</p>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t">
                  <Link href="/student/skills" className="w-full">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                      Review Personalized Skill Gap Roadmap <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
