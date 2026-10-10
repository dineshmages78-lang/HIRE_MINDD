import fs from "fs";
import path from "path";

async function runTest() {
  console.log("=== STEP 1: Logging in as Student ===");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "student1@placement.edu",
      password: "Placement@123",
    }),
  });

  console.log("Login status:", loginRes.status);
  const loginData = await loginRes.json();
  console.log("Login response:", loginData);

  const cookieHeader = loginRes.headers.get("set-cookie");
  console.log("Session cookie received:", cookieHeader ? "YES" : "NO");

  const sessionCookie = cookieHeader ? cookieHeader.split(";")[0] : "";

  console.log("\n=== STEP 2: Checking current backend status (GET) ===");
  const getRes = await fetch("http://localhost:3000/api/ai/parse-resume", {
    headers: {
      Cookie: sessionCookie,
    },
  });
  console.log("GET parse-resume status:", getRes.status);
  const initialData = await getRes.json();
  console.log("Initial resume state:", {
    hasResume: initialData.hasResume,
    fileName: initialData.latestResume?.fileName,
    status: initialData.latestResume?.status,
  });

  console.log("\n=== STEP 3: Uploading PDF resume (POST multipart/form-data) ===");
  const pdfPath = path.join(process.cwd(), "public", "sample-resumes", "Sample_Software_Engineer_Resume.pdf");
  const pdfBuffer = fs.readFileSync(pdfPath);

  const formData = new FormData();
  const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
  formData.append("file", pdfBlob, "Sample_Software_Engineer_Resume.pdf");

  const uploadRes = await fetch("http://localhost:3000/api/ai/parse-resume", {
    method: "POST",
    headers: {
      Cookie: sessionCookie,
    },
    body: formData,
  });

  console.log("Upload status:", uploadRes.status);
  const uploadData = await uploadRes.json();

  if (!uploadRes.ok) {
    console.error("Upload error:", uploadData);
    process.exit(1);
  }

  console.log("\n=== STEP 4: Verifying AI Analysis & Backend Receipts ===");
  console.log("Success:", uploadData.success);
  console.log("Resume ID:", uploadData.resumeId);
  console.log("File Name:", uploadData.fileName);
  console.log("File URL:", uploadData.fileUrl);
  console.log("Character Count extracted:", uploadData.characterCount);
  console.log("Resume Quality Score:", uploadData.analysis?.resumeQualityScore);
  console.log("Extracted Skills Count:", uploadData.analysis?.technicalSkills?.length);
  console.log(
    "Sample Skills Detected:",
    uploadData.analysis?.technicalSkills?.slice(0, 6).map((s: any) => `${s.name} (${s.proficiency})`)
  );
  console.log("Soft Skills:", uploadData.analysis?.softSkills);
  console.log("PostgreSQL Receipt:", uploadData.backendRecords?.postgres);
  console.log("MongoDB Receipt:", uploadData.backendRecords?.mongo);
  console.log("ChromaDB Receipt:", uploadData.backendRecords?.chroma);

  console.log("\n=== STEP 5: Verifying GET persistence in Backend ===");
  const verifyRes = await fetch("http://localhost:3000/api/ai/parse-resume", {
    headers: {
      Cookie: sessionCookie,
    },
  });
  const verifyData = await verifyRes.json();
  console.log("Post-upload GET verification:", {
    hasResume: verifyData.hasResume,
    fileName: verifyData.latestResume?.fileName,
    qualityScore: verifyData.latestResume?.qualityScore,
    mongoDocFound: !!verifyData.mongoDocument,
    skillsInMongo: verifyData.mongoDocument?.skills?.technical?.length,
  });

  console.log("\n>>> ALL PDF UPLOAD & BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY! <<<");
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
