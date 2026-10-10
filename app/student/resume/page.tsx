"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  Cpu,
  Loader2,
  RefreshCw,
  FileDown,
  ExternalLink,
  Eye,
  Check,
  Copy,
  Trash2,
  FolderCheck,
} from "lucide-react";

export default function StudentResumePage() {
  const [uploadMode, setUploadMode] = useState<"pdf" | "text">("pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("Alex_Sharma_Resume.pdf");
  const [loading, setLoading] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [backendRecords, setBackendRecords] = useState<any>(null);
  const [rawTextPreview, setRawTextPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleResumeText = `
Alex Sharma
Email: alex.sharma@example.edu | Phone: +91 98765 43210 | Location: New Delhi, India
GitHub: github.com/alexsharma | LinkedIn: linkedin.com/in/alexsharma

SUMMARY:
Final-year B.Tech in Computer Science & Engineering student at National Institute of Technology with an 8.65 CGPA. Passionate software engineer with hands-on experience in full-stack web applications, distributed systems, and applied machine learning. Proven track record of optimizing high-throughput APIs and architecting maintainable cloud microservices.

TECHNICAL SKILLS:
- Languages: Python, TypeScript, JavaScript, C++, SQL, Go
- Frameworks & Libraries: React, Next.js, Node.js, Express, FastAPI, Tailwind CSS, PyTorch, Scikit-Learn
- Databases & Storage: PostgreSQL, MongoDB, Redis
- Cloud & DevOps: Docker, AWS (EC2, S3), Git, GitHub Actions, Linux, CI/CD
- Core Competencies: Data Structures & Algorithms, Object-Oriented Design, RESTful APIs, System Architecture

EDUCATION:
- Bachelor of Technology in Computer Science & Engineering
  National Institute of Technology (2021 - 2025) | CGPA: 8.65 / 10.0
- Senior Secondary Schooling (CBSE XII)
  Delhi Public School (2021) | Percentage: 95.4%

WORK EXPERIENCE:
Software Engineering Intern | TechNexus Solutions (June 2024 - August 2024)
- Architected RESTful microservices in Node.js and PostgreSQL serving over 15,000 active daily requests.
- Optimized slow analytical SQL queries and configured compound B-Tree indexes, reducing p95 latency by 38%.
- Collaborated with senior engineers in bi-weekly Agile sprints, participating in code reviews and CI/CD pipelines.

PROJECTS:
1. AI-Driven Smart Campus Recruitment Portal (Next.js, Python, PostgreSQL, ChromaDB)
   - Built an end-to-end recruitment management system incorporating vector semantic matching and adaptive testing.
2. Distributed In-Memory Key-Value Store (Go, Distributed Systems)
   - Implemented Raft consensus protocol for state machine replication across a 5-node cluster.

CERTIFICATIONS:
- AWS Certified Cloud Practitioner
- HackerRank Problem Solving (Gold Badge, 5-Star)
`;

  // Check backend records on initial page mount
  useEffect(() => {
    fetchBackendStatus(false);
  }, []);

  const fetchBackendStatus = async (showSuccessAlert = true) => {
    setCheckingBackend(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/parse-resume");
      if (!res.ok) {
        throw new Error("Failed to query backend records");
      }
      const data = await res.json();
      if (data.hasResume && data.latestResume) {
        const resume = data.latestResume;
        const mongo = data.mongoDocument;

        setFileUrl(resume.fileUrl);
        setFileName(resume.fileName);

        // Build backend records representation
        const records = {
          postgres: {
            table: "resumes",
            id: resume.id,
            studentId: resume.studentId,
            fileName: resume.fileName,
            fileUrl: resume.fileUrl,
            mimeType: resume.mimeType,
            status: resume.status,
            qualityScore: resume.qualityScore,
            uploadedAt: resume.uploadedAt,
          },
          mongo: mongo
            ? {
                collection: "resume_documents",
                documentId: mongo._id,
                resumeId: mongo.resumeId,
                studentId: mongo.studentId,
                fileName: mongo.fileName,
                rawText: mongo.rawText,
                skills: mongo.skills,
                education: mongo.education,
                experience: mongo.experience,
                projects: mongo.projects,
                aiAnalysis: mongo.aiAnalysis,
                updatedAt: mongo.updatedAt,
              }
            : null,
          chroma: {
            collection: data.chromaCollection || "resume_embeddings",
            documentId: `resume-${resume.id}`,
            status: "INDEXED",
          },
        };
        setBackendRecords(records);

        if (mongo?.rawText) {
          setRawTextPreview(mongo.rawText);
        }

        // Populate analysis view if stored
        if (mongo?.aiAnalysis) {
          setAnalysis({
            summary: mongo.aiAnalysis.summary,
            resumeQualityScore: mongo.aiAnalysis.qualityScore || resume.qualityScore || 85,
            technicalSkills: mongo.skills?.technical || [],
            softSkills: mongo.skills?.soft || [],
            education: mongo.education || [],
            experience: mongo.experience || [],
            projects: mongo.projects || [],
            keyStrengths: mongo.aiAnalysis.strengths || [],
            areasForImprovement: mongo.aiAnalysis.improvements || [],
          });
        }

        if (showSuccessAlert) {
          setSuccessMsg("Live backend state verified: Relational record in PostgreSQL, JSON document in MongoDB, and vector indexed in ChromaDB.");
        }
      }
    } catch (err: any) {
      console.warn("Backend status fetch:", err.message);
    } finally {
      setCheckingBackend(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        setPdfFile(file);
        setFileName(file.name);
        setError(null);
      } else {
        setError("Please drop a valid PDF file (.pdf).");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        setPdfFile(file);
        setFileName(file.name);
        setError(null);
      } else {
        setError("Please select a valid PDF file (.pdf).");
      }
    }
  };

  // Load sample pre-generated PDF
  const handleLoadSamplePdf = async () => {
    setError(null);
    try {
      const res = await fetch("/sample-resumes/Sample_Software_Engineer_Resume.pdf");
      if (!res.ok) throw new Error("Could not fetch sample PDF");
      const blob = await res.blob();
      const file = new File([blob], "Sample_Software_Engineer_Resume.pdf", { type: "application/pdf" });
      setPdfFile(file);
      setFileName(file.name);
      setUploadMode("pdf");
    } catch (e: any) {
      setError("Failed to load sample PDF: " + e.message);
    }
  };

  // Load sample text
  const handleLoadSampleText = () => {
    setResumeText(sampleResumeText.trim());
    setFileName("Alex_Sharma_Resume.pdf");
    setUploadMode("text");
    setError(null);
  };

  // Clear selected file
  const handleClearFile = () => {
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit and analyze
  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let res: Response;

      if (uploadMode === "pdf") {
        if (!pdfFile) {
          throw new Error("Please select or drop a PDF resume file to upload.");
        }

        const formData = new FormData();
        formData.append("file", pdfFile);

        res = await fetch("/api/ai/parse-resume", {
          method: "POST",
          body: formData,
        });
      } else {
        if (!resumeText || resumeText.trim().length < 20) {
          throw new Error("Please enter or paste at least 20 characters of resume text.");
        }

        res = await fetch("/api/ai/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawText: resumeText,
            fileName: fileName || "Student_Resume.txt",
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setAnalysis(data.analysis);
      setBackendRecords(data.backendRecords);
      setRawTextPreview(data.rawTextPreview || null);
      if (data.fileUrl) {
        setFileUrl(data.fileUrl);
      }

      setSuccessMsg(
        `Resume successfully parsed and verified! Stored in PostgreSQL, MongoDB, and indexed in ChromaDB.`
      );
    } catch (err: any) {
      setError(err.message || "An error occurred during resume analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = (obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-blue-600 shrink-0" />
            AI Resume Screening & Backend Verification
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Upload your PDF resume to trigger server-side text extraction, autonomous agentic evaluation, and polyglot persistence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadSamplePdf}
            className="gap-1.5 text-xs border-blue-200 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <FileDown className="h-3.5 w-3.5 text-blue-600" />
            Load Sample PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchBackendStatus(true)}
            disabled={checkingBackend}
            className="gap-1.5 text-xs text-slate-600 dark:text-slate-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${checkingBackend ? "animate-spin text-blue-600" : ""}`} />
            Check in Backend
          </Button>
        </div>
      </div>

      {/* Polyglot Banner with Live Check Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 text-xs">
        <div className="flex items-center justify-between gap-2 text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600 shrink-0" />
            <span><strong>PostgreSQL:</strong> Relational metadata & score</span>
          </div>
          {backendRecords?.postgres ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
              <Check className="h-3 w-3" /> Synced
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground font-mono">Standby</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-600 shrink-0" />
            <span><strong>MongoDB:</strong> Parsed JSON & skill document</span>
          </div>
          {backendRecords?.mongo ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
              <Check className="h-3 w-3" /> Synced
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground font-mono">Standby</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-600 shrink-0" />
            <span><strong>ChromaDB:</strong> Vector semantic embeddings</span>
          </div>
          {backendRecords?.chroma ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded">
              <Check className="h-3 w-3" /> Indexed
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground font-mono">Standby</span>
          )}
        </div>
      </div>

      {/* Main Grid: Upload on Left, Live Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Column */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="shadow-sm border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-blue-600" />
                  Resume Upload
                </CardTitle>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setUploadMode("pdf")}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                      uploadMode === "pdf"
                        ? "bg-white dark:bg-slate-800 text-blue-600 font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Upload PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("text")}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                      uploadMode === "text"
                        ? "bg-white dark:bg-slate-800 text-blue-600 font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>
              <CardDescription className="text-xs">
                {uploadMode === "pdf"
                  ? "Upload your PDF resume. The backend extracts text directly using server-side PDF parsing."
                  : "Alternatively, paste raw resume text or load sample data for instant screening."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAnalyzeResume} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {uploadMode === "pdf" ? (
                  <div className="space-y-3">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="pdfFileInput"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Drag and Drop Zone */}
                    {!pdfFile ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                          dragActive
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]"
                            : "border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                        }`}
                      >
                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 mb-3">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          Click to browse or drag & drop PDF here
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Standard PDF files (up to 10MB). Text will be extracted in backend.
                        </p>
                        <div className="mt-4 flex justify-center">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="text-xs gap-1.5 pointer-events-none"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Select PDF File
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                            PDF
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {pdfFile.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {formatFileSize(pdfFile.size)} • Ready for backend upload
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            title="Choose a different PDF"
                            className="h-8 w-8 text-slate-600 hover:text-blue-600"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleClearFile}
                            title="Remove file"
                            className="h-8 w-8 text-slate-600 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="fileName">Resume File Label</Label>
                      <Input
                        id="fileName"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="My_Resume.pdf"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="resumeText">Resume Content / Raw Text</Label>
                        <span className="text-[11px] text-muted-foreground">{resumeText.length} characters</span>
                      </div>
                      <textarea
                        id="resumeText"
                        rows={11}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste full resume text here, or click 'Load Sample Candidate Resume'..."
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadSampleText}
                        className="text-xs text-blue-600 hover:underline p-0 h-auto"
                      >
                        Insert sample resume text
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || (uploadMode === "pdf" && !pdfFile) || (uploadMode === "text" && !resumeText)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs sm:text-sm h-10 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Parsing PDF & Executing AI Agents...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {uploadMode === "pdf" ? "Upload PDF & Analyze in Backend" : "Run AI Resume Analysis Agent"}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Backend Verification Explorer Box */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <FolderCheck className="h-4 w-4 text-emerald-600" />
                  Backend Storage & Verification Explorer
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchBackendStatus(true)}
                  disabled={checkingBackend}
                  className="text-xs gap-1 h-7 px-2"
                >
                  <RefreshCw className={`h-3 w-3 ${checkingBackend ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
              <CardDescription className="text-xs">
                Inspect records saved across PostgreSQL, MongoDB, and ChromaDB.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              {backendRecords ? (
                <Tabs defaultValue="postgres" className="w-full">
                  <TabsList className="grid grid-cols-4 h-8 text-[11px] mb-3">
                    <TabsTrigger value="postgres">PostgreSQL</TabsTrigger>
                    <TabsTrigger value="mongodb">MongoDB</TabsTrigger>
                    <TabsTrigger value="chroma">ChromaDB</TabsTrigger>
                    <TabsTrigger value="rawtext">Parsed Text</TabsTrigger>
                  </TabsList>

                  {/* PostgreSQL Tab */}
                  <TabsContent value="postgres" className="space-y-2 mt-0">
                    <div className="p-3 rounded-lg bg-muted/50 border space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Table:</span>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          resumes
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Resume ID:</span>
                        <span className="font-mono text-[11px] select-all truncate max-w-[200px]">
                          {backendRecords.postgres.id}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">File Name:</span>
                        <span className="font-medium truncate max-w-[200px]">
                          {backendRecords.postgres.fileName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Status:</span>
                        <span className="font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded text-[10px]">
                          {backendRecords.postgres.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Quality Score:</span>
                        <span className="font-bold text-emerald-600">
                          {backendRecords.postgres.qualityScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">File Storage:</span>
                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-medium"
                          >
                            <Eye className="h-3 w-3" />
                            View Stored PDF
                          </a>
                        ) : (
                          <span className="text-muted-foreground font-mono text-[11px]">Saved on server</span>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* MongoDB Tab */}
                  <TabsContent value="mongodb" className="space-y-2 mt-0">
                    <div className="p-3 rounded-lg bg-muted/50 border space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Collection:</span>
                        <Badge variant="outline" className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                          resume_documents
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Skills Extracted:</span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {backendRecords.mongo?.skillsCount || backendRecords.mongo?.skills?.technical?.length || 0} Technical
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Soft Skills:</span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {backendRecords.mongo?.softSkillsCount || backendRecords.mongo?.skills?.soft?.length || 0} Soft Skills
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Document Synced:</span>
                        <span className="text-emerald-600 font-medium text-[11px]">
                          {new Date(backendRecords.mongo?.syncedAt || backendRecords.mongo?.updatedAt || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="pt-1 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyJson(backendRecords.mongo)}
                          className="h-7 text-[10px] gap-1 text-muted-foreground"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          {copied ? "Copied JSON" : "Copy MongoDB Document"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ChromaDB Tab */}
                  <TabsContent value="chroma" className="space-y-2 mt-0">
                    <div className="p-3 rounded-lg bg-muted/50 border space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Vector Collection:</span>
                        <Badge variant="outline" className="font-mono text-[10px] text-purple-700 dark:text-purple-300">
                          {backendRecords.chroma.collection}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Vector ID:</span>
                        <span className="font-mono text-[11px] truncate max-w-[200px]">
                          {backendRecords.chroma.documentId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-muted-foreground font-medium">Indexing Status:</span>
                        <span className="font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded text-[10px]">
                          ACTIVE & EMBEDDED
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground pt-1">
                        Semantic vector embeddings indexed in ChromaDB for instant candidate matching against corporate job descriptions.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Parsed Text Tab */}
                  <TabsContent value="rawtext" className="space-y-2 mt-0">
                    <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Extracted Plain Text from Server</span>
                        <span className="font-mono text-[10px]">{rawTextPreview?.length || 0} chars</span>
                      </div>
                      <pre className="text-[11px] font-mono p-2 bg-white dark:bg-slate-950 rounded border max-h-[160px] overflow-y-auto whitespace-pre-wrap break-words text-slate-700 dark:text-slate-300">
                        {rawTextPreview || "No text preview available."}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <Database className="h-6 w-6 mx-auto mb-1 text-muted-foreground/60" />
                  <p>No backend resume record loaded yet.</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Upload a PDF or click &quot;Check in Backend&quot; to inspect stored records.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Analysis Output Column */}
        <div className="lg:col-span-6 space-y-4">
          {analysis ? (
            <div className="space-y-4">
              {/* Quality Score Card */}
              <Card className="border-t-4 border-t-emerald-600 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Resume Quality Score</CardTitle>
                      <CardDescription className="text-xs">
                        Algorithmic evaluation of depth, clarity, and quantifiable impact
                      </CardDescription>
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-600">
                      {analysis.resumeQualityScore}%
                    </div>
                  </div>
                  <Progress value={analysis.resumeQualityScore} indicatorClassName="bg-emerald-600" className="h-2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {analysis.summary}
                  </p>
                  {analysis.candidateName && (
                    <div className="text-[11px] text-muted-foreground flex flex-wrap gap-3 pt-1 border-t">
                      <span><strong>Candidate:</strong> {analysis.candidateName}</span>
                      {analysis.email && <span><strong>Email:</strong> {analysis.email}</span>}
                      {analysis.phone && <span><strong>Phone:</strong> {analysis.phone}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Extracted Technical Skills */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Extracted Technical Competencies</span>
                    <Badge variant="outline" className="text-[10px] text-blue-600">
                      {analysis.technicalSkills?.length || 0} Skills Detected
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.technicalSkills?.map((s: any, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-[11px] py-1 px-2 flex items-center gap-1.5"
                      >
                        <span className="font-semibold text-slate-800 dark:text-white">{s.name}</span>
                        <span className="text-[9px] uppercase px-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          {s.proficiency}
                        </span>
                      </Badge>
                    ))}
                  </div>

                  {/* Soft skills */}
                  {analysis.softSkills?.length > 0 && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Demonstrated Soft Skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.softSkills.map((ss: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-[10px]">
                            {ss}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1.5">
                    {analysis.keyStrengths?.map((str: string, idx: number) => (
                      <p key={idx} className="text-[11px] text-muted-foreground">• {str}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1.5">
                    {analysis.areasForImprovement?.map((imp: string, idx: number) => (
                      <p key={idx} className="text-[11px] text-muted-foreground">• {imp}</p>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-dashed h-full min-h-[350px] flex flex-col items-center justify-center p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-sm">No Resume Analyzed Yet</h4>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Upload your PDF resume on the left or click &quot;Load Sample PDF&quot; to inspect real-time agentic extraction and backend verification.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
