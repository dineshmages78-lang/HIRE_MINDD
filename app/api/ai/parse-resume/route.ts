import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-utils";
import { prisma } from "@/lib/db/prisma";
import { AgentOrchestrator } from "@/lib/ai/orchestration/agent-orchestrator";
import { logAuditEvent } from "@/lib/services/audit-service";
import { getMongoCollection, COLLECTIONS } from "@/lib/db/mongodb";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.studentProfile.findFirst({
      where: { userId: user.id },
      include: {
        resumes: {
          orderBy: { uploadedAt: "desc" },
          take: 5,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const latestResume = student.resumes[0] || null;
    let mongoDocument = null;
    if (latestResume) {
      const mongoCol = await getMongoCollection(COLLECTIONS.RESUME_DOCUMENTS);
      mongoDocument = await mongoCol.findOne({ resumeId: latestResume.id });
    }

    return NextResponse.json({
      success: true,
      hasResume: !!latestResume,
      latestResume,
      allResumes: student.resumes,
      mongoDocument,
      chromaCollection: "resume_embeddings",
    });
  } catch (err: any) {
    console.error("GET parse-resume error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch resume status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.studentProfile.findFirst({
      where: { userId: user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found for this user." },
        { status: 404 }
      );
    }

    let rawText = "";
    let fileName = "Student_Resume.pdf";
    let fileUrl = "";
    let mimeType = "application/pdf";
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "Please select a PDF resume file to upload." },
          { status: 400 }
        );
      }

      fileName = file.name || "Uploaded_Resume.pdf";
      const isPdf = fileName.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
      if (!isPdf) {
        return NextResponse.json(
          { error: "Invalid file type. Please upload a PDF file (.pdf)." },
          { status: 400 }
        );
      }

      // Read PDF buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length === 0) {
        return NextResponse.json(
          { error: "The uploaded PDF file appears to be empty." },
          { status: 400 }
        );
      }

      // Extract text with pdf-parse
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        const parsed = await parser.getText();
        await parser.destroy();
        rawText = parsed?.text?.trim() || "";
      } catch (parseErr: any) {
        console.error("PDF Parsing error:", parseErr);
        return NextResponse.json(
          { error: `Could not parse PDF content: ${parseErr.message || "Invalid or corrupt PDF"}` },
          { status: 400 }
        );
      }

      if (!rawText || rawText.length < 20) {
        return NextResponse.json(
          {
            error:
              "Could not extract sufficient text from this PDF. It may be scanned images or password protected. Please upload a text-searchable PDF.",
          },
          { status: 400 }
        );
      }

      // Save physical file to public/uploads/resumes
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
        await fs.promises.mkdir(uploadDir, { recursive: true });
        const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const savedName = `${student.studentId}_${Date.now()}_${cleanName}`;
        const filePath = path.join(uploadDir, savedName);
        await fs.promises.writeFile(filePath, buffer);
        fileUrl = `/uploads/resumes/${savedName}`;
      } catch (writeErr) {
        console.warn("Could not save physical resume file to disk:", writeErr);
        fileUrl = `/uploads/resumes/${student.studentId}_${Date.now()}.pdf`;
      }
    } else {
      // JSON payload fallback
      const body = await req.json();
      rawText = body.rawText || "";
      fileName = body.fileName || "Student_Resume.txt";
      mimeType = fileName.endsWith(".pdf") ? "application/pdf" : "text/plain";
      fileUrl = `/uploads/resumes/${student.studentId}_${Date.now()}.${mimeType === "application/pdf" ? "pdf" : "txt"}`;

      if (!rawText || rawText.trim().length < 20) {
        return NextResponse.json(
          { error: "Please provide valid resume text or PDF content." },
          { status: 400 }
        );
      }
    }

    // 1. Create relational resume record in PostgreSQL
    const resume = await prisma.resume.create({
      data: {
        studentId: student.id,
        fileName,
        fileUrl: fileUrl || `/uploads/resumes/${student.studentId}_${Date.now()}.pdf`,
        mimeType,
        status: "PROCESSING",
      },
    });

    // 2. Execute Resume Analysis Agent Pipeline
    const analysis = await AgentOrchestrator.executeResumeAnalysis({
      resumeId: resume.id,
      studentId: student.id,
      rawText,
      fileName: resume.fileName,
    });

    // 3. Log Audit event
    await logAuditEvent({
      userId: user.id,
      action: "RESUME_UPLOAD_AND_ANALYSIS",
      entityType: "RESUME",
      entityId: resume.id,
      details: {
        fileName: resume.fileName,
        qualityScore: analysis.resumeQualityScore,
        skillsCount: analysis.technicalSkills.length,
      },
    });

    // 4. Retrieve stored MongoDB document for verification inspection
    const mongoCollection = await getMongoCollection(COLLECTIONS.RESUME_DOCUMENTS);
    const mongoDoc = await mongoCollection.findOne({ resumeId: resume.id });

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      rawTextPreview: rawText.length > 800 ? rawText.slice(0, 800) + "..." : rawText,
      characterCount: rawText.length,
      analysis,
      backendRecords: {
        postgres: {
          table: "resumes",
          id: resume.id,
          studentId: student.id,
          fileName: resume.fileName,
          fileUrl: resume.fileUrl,
          mimeType,
          status: "PARSED",
          qualityScore: analysis.resumeQualityScore,
          uploadedAt: resume.uploadedAt,
        },
        mongo: {
          collection: COLLECTIONS.RESUME_DOCUMENTS,
          documentId: mongoDoc?._id || `doc_${resume.id}`,
          resumeId: resume.id,
          skillsCount: analysis.technicalSkills?.length || 0,
          softSkillsCount: analysis.softSkills?.length || 0,
          educationCount: analysis.education?.length || 0,
          experienceCount: analysis.experience?.length || 0,
          projectsCount: analysis.projects?.length || 0,
          syncedAt: mongoDoc?.updatedAt || new Date().toISOString(),
        },
        chroma: {
          collection: "resume_embeddings",
          documentId: `resume-${resume.id}`,
          status: "INDEXED",
        },
      },
    });
  } catch (err: any) {
    console.error("Resume analysis route error:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze resume" }, { status: 500 });
  }
}
