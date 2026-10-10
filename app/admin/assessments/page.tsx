"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QuestionCodeRenderer } from "@/components/assessment/question-code-renderer";
import {
  CheckSquare,
  Sparkles,
  Plus,
  Loader2,
  Clock,
  CheckCircle2,
  HelpCircle,
  Eye,
  Trash2,
  Code2,
  FileQuestion,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selected Assessment Questions Inspector
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Generator form
  const [formData, setFormData] = useState({
    jobId: "",
    title: "",
    durationMinutes: "25",
    passingScore: "70",
    numQuestions: "5",
    targetSkills: "Python, SQL, System Architecture",
    difficulty: "MEDIUM",
  });

  // Manual Add Question Form
  const [questionFormData, setQuestionFormData] = useState({
    text: "",
    codeSnippet: "",
    codeLanguage: "typescript",
    option0: "",
    option1: "",
    option2: "",
    option3: "",
    correctOption: 0,
    difficulty: "MEDIUM",
    skill: "Software Engineering",
    topic: "Programming Logic",
  });

  useEffect(() => {
    fetchAssessments();
    fetchJobs();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await fetch("/api/assessments");
      const data = await res.json();
      if (data.assessments) setAssessments(data.assessments);
    } catch (e) {
      console.error("Failed to load assessments", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        if (data.jobs.length > 0 && !formData.jobId) {
          setFormData((prev) => ({ ...prev, jobId: data.jobs[0].id }));
        }
      }
    } catch (e) {}
  };

  const handleOpenQuestions = async (assessmentId: string) => {
    if (selectedAssessmentId === assessmentId) {
      setSelectedAssessmentId(null);
      return;
    }
    setSelectedAssessmentId(assessmentId);
    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/assessments/questions?assessmentId=${assessmentId}`);
      const data = await res.json();
      if (data.questions) {
        setAssessmentQuestions(data.questions);
      }
    } catch (e) {
      console.error("Failed to fetch assessment questions", e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const skillsArray = formData.targetSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetSkills: skillsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create assessment");
      }

      setShowCreateModal(false);
      fetchAssessments();
      alert(`Assessment created! Question Generation Agent synthesized ${data.generatedCount} vetted MCQs.`);
    } catch (err: any) {
      alert(err.message || "Failed to create assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessmentId) return;
    setSubmittingQuestion(true);

    try {
      const options = [
        questionFormData.option0,
        questionFormData.option1,
        questionFormData.option2,
        questionFormData.option3,
      ];

      const res = await fetch("/api/assessments/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: selectedAssessmentId,
          text: questionFormData.text,
          codeSnippet: questionFormData.codeSnippet,
          codeLanguage: questionFormData.codeLanguage,
          options,
          correctOption: questionFormData.correctOption,
          difficulty: questionFormData.difficulty,
          skill: questionFormData.skill,
          topic: questionFormData.topic,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add question");

      setShowAddQuestionModal(false);
      // Reset form
      setQuestionFormData({
        text: "",
        codeSnippet: "",
        codeLanguage: "typescript",
        option0: "",
        option1: "",
        option2: "",
        option3: "",
        correctOption: 0,
        difficulty: "MEDIUM",
        skill: "Software Engineering",
        topic: "Programming Logic",
      });

      // Refresh questions and assessment list
      handleOpenQuestions(selectedAssessmentId);
      fetchAssessments();
      alert("Programming question successfully added!");
    } catch (err: any) {
      alert(err.message || "Failed to add question");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/assessments/questions?id=${questionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAssessmentQuestions((prev) => prev.filter((q) => q.id !== questionId));
        fetchAssessments();
      }
    } catch (e) {
      console.error("Failed to delete question", e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Assessment Management & Programming Question Pool
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage adaptive tests, inspect active questions with code blocks, and add custom programming questions.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {showCreateModal ? "Close Generator" : "New AI-Generated Assessment"}
        </Button>
      </div>

      {showCreateModal && (
        <Card className="border-2 border-blue-500 shadow-md">
          <form onSubmit={handleCreateAssessment}>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/40 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Assessment Question Generation Agent
              </CardTitle>
              <CardDescription className="text-xs">
                AI synthesizes authentic coding and conceptual questions with verified answers and explanations.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="jobId">Target Corporate Job</Label>
                  <select
                    id="jobId"
                    value={formData.jobId}
                    onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.company?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="title">Assessment Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Distributed Systems & Core DSA Screening"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="passingScore">Passing Cutoff (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="numQuestions">Number of AI Questions</Label>
                  <Input
                    id="numQuestions"
                    type="number"
                    value={formData.numQuestions}
                    onChange={(e) => setFormData({ ...formData, numQuestions: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="targetSkills">Target Skills (Comma-separated)</Label>
                <Input
                  id="targetSkills"
                  value={formData.targetSkills}
                  onChange={(e) => setFormData({ ...formData, targetSkills: e.target.value })}
                  placeholder="Python, React, SQL, Cloud Architecture"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Synthesizing & Validating Questions with AI Agent...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Question Pool & Publish Assessment
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Existing Assessments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          assessments.map((test) => {
            const isSelected = selectedAssessmentId === test.id;
            return (
              <Card key={test.id} className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/40 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {test.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {test.job?.company?.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Role: {test.job?.title} • Duration: {test.durationMinutes} mins • Cutoff: {test.passingScore}%
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                        {test._count?.questions || test.totalQuestions} Questions Available
                      </Badge>
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleOpenQuestions(test.id)}
                        className="text-xs gap-1.5 h-8"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {isSelected ? "Hide Questions" : "Inspect Questions"}
                        {isSelected ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Questions Inspector */}
                {isSelected && (
                  <CardContent className="p-4 sm:p-6 border-t bg-slate-50/30 dark:bg-slate-950/20 space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-blue-600" />
                          Question Bank ({assessmentQuestions.length} Questions)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Adaptive engine pulls dynamically from this question bank.
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => setShowAddQuestionModal(!showAddQuestionModal)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Programming Question
                      </Button>
                    </div>

                    {/* Add Question Form Modal / Collapsible */}
                    {showAddQuestionModal && (
                      <Card className="border border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 p-4">
                        <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
                          <h5 className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Add New Question with Code Snippet
                          </h5>

                          <div className="space-y-1">
                            <Label htmlFor="qText">Question Prompt / Title</Label>
                            <Input
                              id="qText"
                              value={questionFormData.text}
                              onChange={(e) => setQuestionFormData({ ...questionFormData, text: e.target.value })}
                              placeholder="e.g. What will be the output of the following TypeScript code?"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="qLang">Code Language</Label>
                              <select
                                id="qLang"
                                value={questionFormData.codeLanguage}
                                onChange={(e) => setQuestionFormData({ ...questionFormData, codeLanguage: e.target.value })}
                                className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                              >
                                <option value="typescript">TypeScript</option>
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="sql">SQL</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="docker">Docker</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="qDiff">Difficulty Level</Label>
                              <select
                                id="qDiff"
                                value={questionFormData.difficulty}
                                onChange={(e) => setQuestionFormData({ ...questionFormData, difficulty: e.target.value })}
                                className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                              >
                                <option value="EASY">EASY</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HARD">HARD</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="qCode">Programming Code Snippet (Optional)</Label>
                            <textarea
                              id="qCode"
                              rows={4}
                              value={questionFormData.codeSnippet}
                              onChange={(e) => setQuestionFormData({ ...questionFormData, codeSnippet: e.target.value })}
                              placeholder="function calculate() { ... }"
                              className="w-full rounded border border-input bg-background p-2 font-mono text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label>Option A (0)</Label>
                              <Input
                                value={questionFormData.option0}
                                onChange={(e) => setQuestionFormData({ ...questionFormData, option0: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Option B (1)</Label>
                              <Input
                                value={questionFormData.option1}
                                onChange={(e) => setQuestionFormData({ ...questionFormData, option1: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Option C (2)</Label>
                              <Input
                                value={questionFormData.option2}
                                onChange={(e) => setQuestionFormData({ ...questionFormData, option2: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Option D (3)</Label>
                              <Input
                                value={questionFormData.option3}
                                onChange={(e) => setQuestionFormData({ ...questionFormData, option3: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="qCorrect">Correct Option</Label>
                              <select
                                id="qCorrect"
                                value={questionFormData.correctOption}
                                onChange={(e) => setQuestionFormData({ ...questionFormData, correctOption: Number(e.target.value) })}
                                className="w-full h-8 rounded border border-input bg-background px-2 text-xs font-semibold"
                              >
                                <option value={0}>Option A (0)</option>
                                <option value={1}>Option B (1)</option>
                                <option value={2}>Option C (2)</option>
                                <option value={3}>Option D (3)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="qSkill">Skill Tag</Label>
                              <Input
                                id="qSkill"
                                value={questionFormData.skill}
                                onChange={(e) => setQuestionFormData({ ...questionFormData, skill: e.target.value })}
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="qTopic">Topic</Label>
                              <Input
                                id="qTopic"
                                value={questionFormData.topic}
                                onChange={(e) => setQuestionFormData({ ...questionFormData, topic: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              type="submit"
                              disabled={submittingQuestion}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8"
                            >
                              {submittingQuestion ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                              Save to Question Bank
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowAddQuestionModal(false)}
                              className="text-xs h-8"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Card>
                    )}

                    {/* Questions Listing */}
                    {loadingQuestions ? (
                      <div className="flex justify-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {assessmentQuestions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-xl border bg-card shadow-sm space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">
                                  #{idx + 1}
                                </span>
                                <Badge variant="outline" className="text-[10px]">
                                  {q.skill}
                                </Badge>
                                <Badge
                                  variant={
                                    q.difficulty === "HARD"
                                      ? "destructive"
                                      : q.difficulty === "MEDIUM"
                                      ? "warning"
                                      : "success"
                                  }
                                  className="text-[10px] font-bold"
                                >
                                  {q.difficulty}
                                </Badge>
                                {q.isProgramming && (
                                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[10px]">
                                    <Code2 className="h-3 w-3 mr-1 inline" /> Code Question
                                  </Badge>
                                )}
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            {/* Question text with syntax-highlighted code renderer */}
                            <QuestionCodeRenderer text={q.text} />

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                              {q.options.map((opt: string, optIdx: number) => {
                                const isCorrect = optIdx === q.correctOption;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                                      isCorrect
                                        ? "border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold"
                                        : "bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400"
                                    }`}
                                  >
                                    <span className="font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center bg-background border">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                    {isCorrect && (
                                      <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-emerald-600 shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
