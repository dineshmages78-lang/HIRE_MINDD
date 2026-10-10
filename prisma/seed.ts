import { PrismaClient, RoleType, DifficultyLevel } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getMongoCollection, COLLECTIONS } from "../lib/db/mongodb";
import { addDocument, CHROMA_COLLECTIONS } from "../lib/ai/retrieval/chroma-service";

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

async function main() {
  console.log("Starting full polyglot database seed...");

  // Clear existing PostgreSQL tables
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.interviewEvaluation.deleteMany();
  await prisma.interviewSession.deleteMany();
  await prisma.assessmentResponse.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.job.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.company.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // Clear MongoDB demo documents
  for (const collName of Object.values(COLLECTIONS)) {
    const col = await getMongoCollection(collName);
    await col.deleteMany({});
  }

  // 1. Create Roles
  const adminRole = await prisma.role.create({ data: { name: RoleType.ADMIN } });
  const recruiterRole = await prisma.role.create({ data: { name: RoleType.RECRUITER } });
  const studentRole = await prisma.role.create({ data: { name: RoleType.STUDENT } });

  const defaultPasswordHash = await hashPassword("Placement@123");

  // 2. Create Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@placement.edu",
      passwordHash: defaultPasswordHash,
      firstName: "Dr. Rajesh",
      lastName: "Verma",
      phone: "+91 98111 22334",
      roles: { create: { roleId: adminRole.id } },
      admin: {
        create: {
          designation: "Head of Training & Placement",
          department: "Placement Cell & Industry Relations",
        },
      },
    },
  });

  // 3. Create Companies
  const google = await prisma.company.create({
    data: {
      name: "Google",
      industry: "Information Technology & AI",
      location: "Bengaluru, India",
      website: "https://careers.google.com",
    },
  });

  const microsoft = await prisma.company.create({
    data: {
      name: "Microsoft",
      industry: "Cloud & Enterprise Software",
      location: "Hyderabad, India",
      website: "https://careers.microsoft.com",
    },
  });

  const amazon = await prisma.company.create({
    data: {
      name: "Amazon AWS",
      industry: "Cloud Infrastructure & Distributed Systems",
      location: "Bengaluru, India",
      website: "https://amazon.jobs",
    },
  });

  // 4. Create 2 Recruiters
  const recruiter1 = await prisma.user.create({
    data: {
      email: "sarah.recruiter@google.com",
      passwordHash: defaultPasswordHash,
      firstName: "Sarah",
      lastName: "Jenkins",
      phone: "+91 98222 33445",
      roles: { create: { roleId: recruiterRole.id } },
      recruiter: {
        create: {
          companyId: google.id,
          designation: "University Talent Acquisition Lead",
        },
      },
    },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      email: "michael.recruiter@microsoft.com",
      passwordHash: defaultPasswordHash,
      firstName: "Michael",
      lastName: "Chen",
      phone: "+91 98333 44556",
      roles: { create: { roleId: recruiterRole.id } },
      recruiter: {
        create: {
          companyId: microsoft.id,
          designation: "Principal Technical Campus Recruiter",
        },
      },
    },
  });

  // 5. Create 10 Students
  const studentData = [
    { name: ["Alex", "Sharma"], email: "student1@placement.edu", id: "CS2025001", dept: "Computer Science", degree: "B.Tech", year: 2025, cgpa: 8.65, loc: "Delhi" },
    { name: ["Priya", "Patel"], email: "student2@placement.edu", id: "CS2025002", dept: "Computer Science", degree: "B.Tech", year: 2025, cgpa: 9.15, loc: "Mumbai" },
    { name: ["Rohan", "Gupta"], email: "student3@placement.edu", id: "IT2025003", dept: "Information Technology", degree: "B.Tech", year: 2025, cgpa: 7.85, loc: "Bengaluru" },
    { name: ["Ananya", "Deshmukh"], email: "student4@placement.edu", id: "AI2025004", dept: "Artificial Intelligence & ML", degree: "B.Tech", year: 2025, cgpa: 8.95, loc: "Pune" },
    { name: ["Karan", "Mehta"], email: "student5@placement.edu", id: "CS2025005", dept: "Computer Science", degree: "B.Tech", year: 2025, cgpa: 7.40, loc: "Ahmedabad" },
    { name: ["Sneha", "Reddy"], email: "student6@placement.edu", id: "ECE2025006", dept: "Electronics & Communication", degree: "B.Tech", year: 2025, cgpa: 8.20, loc: "Hyderabad" },
    { name: ["Vikram", "Singh"], email: "student7@placement.edu", id: "IT2025007", dept: "Information Technology", degree: "B.Tech", year: 2025, cgpa: 6.95, loc: "Jaipur" },
    { name: ["Neha", "Iyer"], email: "student8@placement.edu", id: "CS2025008", dept: "Computer Science", degree: "M.Tech", year: 2025, cgpa: 9.35, loc: "Chennai" },
    { name: ["Aditya", "Kumar"], email: "student9@placement.edu", id: "DS2025009", dept: "Data Science & Analytics", degree: "B.Tech", year: 2025, cgpa: 8.10, loc: "Kolkata" },
    { name: ["Tanvi", "Joshi"], email: "student10@placement.edu", id: "CS2025010", dept: "Computer Science", degree: "B.Tech", year: 2025, cgpa: 8.50, loc: "Chandigarh" },
  ];

  const createdStudents = [];

  for (const s of studentData) {
    const studentUser = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: defaultPasswordHash,
        firstName: s.name[0],
        lastName: s.name[1],
        phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        roles: { create: { roleId: studentRole.id } },
        student: {
          create: {
            studentId: s.id,
            college: "National Institute of Technology",
            department: s.dept,
            degree: s.degree,
            graduationYear: s.year,
            cgpa: s.cgpa,
            location: s.loc,
          },
        },
      },
      include: { student: true },
    });

    createdStudents.push(studentUser.student!);
  }

  // 6. Create Resumes for students
  const mongoResumeDocs = await getMongoCollection(COLLECTIONS.RESUME_DOCUMENTS);

  for (let i = 0; i < createdStudents.length; i++) {
    const st = createdStudents[i];
    const resume = await prisma.resume.create({
      data: {
        studentId: st.id,
        fileName: `Resume_${st.studentId}.pdf`,
        fileUrl: `/uploads/resumes/${st.studentId}.pdf`,
        status: "PARSED",
        qualityScore: 80 + (i % 18),
      },
    });

    const skills = [
      { name: "Python", category: "programming", proficiency: "advanced" },
      { name: "TypeScript", category: "programming", proficiency: "intermediate" },
      { name: "React", category: "framework", proficiency: "advanced" },
      { name: "PostgreSQL", category: "database", proficiency: "intermediate" },
      { name: "Docker", category: "cloud_devops", proficiency: "beginner" },
      { name: "Machine Learning", category: "ai_ml", proficiency: "intermediate" },
    ];

    // Seed MongoDB resume document
    await mongoResumeDocs.insertOne({
      resumeId: resume.id,
      studentId: st.id,
      rawText: `Resume of ${studentData[i].name.join(" ")}. Degree: ${st.degree} in ${st.department}. CGPA: ${st.cgpa}. Experience in full-stack web applications and AI.`,
      education: [{ degree: st.degree, fieldOfStudy: st.department, institution: "National Institute of Technology", cgpaOrPercentage: st.cgpa.toString() }],
      skills: { technical: skills, soft: ["Team Collaboration", "Problem Solving", "Communication"] },
      experience: [{ title: "Software Development Intern", company: "Tech Corp", duration: "Summer 2024", highlights: ["Built REST APIs", "Optimized SQL queries"] }],
      projects: [{ title: "AI Placement Assistant", description: "Campus hiring web application", technologies: ["React", "Python", "PostgreSQL"] }],
      certifications: ["AWS Certified Cloud Practitioner"],
      aiAnalysis: {
        summary: `Strong candidate specializing in ${st.department} with solid technical foundations and project portfolio.`,
        qualityScore: resume.qualityScore,
        strengths: ["Strong academic background", "Clean project architecture"],
        improvements: ["Deepen cloud deployment experience"],
      },
    });

    // Seed ChromaDB resume embedding
    await addDocument(CHROMA_COLLECTIONS.RESUME_EMBEDDINGS, {
      id: `resume-${resume.id}`,
      document: `Student: ${studentData[i].name.join(" ")}. Degree: ${st.degree} in ${st.department}. CGPA: ${st.cgpa}. Skills: Python, React, PostgreSQL, Machine Learning.`,
      metadata: { resumeId: resume.id, studentId: st.id, qualityScore: resume.qualityScore },
    });
  }

  // 7. Create 5 Jobs
  const jobDefinitions = [
    {
      companyId: google.id,
      companyName: "Google",
      title: "Software Development Engineer - Campus",
      dept: "Core Engineering",
      location: "Bengaluru, India",
      minCgpa: 7.5,
      skills: ["Python", "C++", "Data Structures", "Algorithms", "System Design"],
      summary: "Design and implement high-scale distributed systems and cloud services powering Google products.",
    },
    {
      companyId: google.id,
      companyName: "Google",
      title: "Associate Machine Learning Engineer",
      dept: "Google Research & Cloud AI",
      location: "Hyderabad, India",
      minCgpa: 8.0,
      skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Mathematics"],
      summary: "Apply cutting-edge deep learning, NLP, and computer vision models to real-world products.",
    },
    {
      companyId: microsoft.id,
      companyName: "Microsoft",
      title: "Full Stack Software Engineer",
      dept: "Azure & Cloud Platform",
      location: "Hyderabad, India",
      minCgpa: 7.0,
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Azure", "Docker"],
      summary: "Build scalable cloud-native web portals and developer experiences for Microsoft Azure.",
    },
    {
      companyId: microsoft.id,
      companyName: "Microsoft",
      title: "Data & Analytics Engineer",
      dept: "Data Platform",
      location: "Bengaluru, India",
      minCgpa: 7.0,
      skills: ["SQL", "Python", "Data Warehousing", "Spark", "ETL Pipelines"],
      summary: "Engineer petabyte-scale data pipelines and real-time analytical dashboards.",
    },
    {
      companyId: amazon.id,
      companyName: "Amazon AWS",
      title: "Cloud Support & Systems Engineer",
      dept: "AWS Infrastructure",
      location: "Bengaluru, India",
      minCgpa: 6.5,
      skills: ["Linux", "Networking", "Python", "Cloud Architecture", "Troubleshooting"],
      summary: "Troubleshoot complex distributed architecture issues and support AWS enterprise customers.",
    },
  ];

  const createdJobs = [];
  const mongoJdDocs = await getMongoCollection(COLLECTIONS.JOB_DESCRIPTIONS);

  for (const jd of jobDefinitions) {
    const job = await prisma.job.create({
      data: {
        companyId: jd.companyId,
        title: jd.title,
        department: jd.dept,
        location: jd.location,
        minCgpa: jd.minCgpa,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "OPEN",
      },
    });

    createdJobs.push(job);

    // MongoDB flexible JD document
    await mongoJdDocs.insertOne({
      jobId: job.id,
      title: jd.title,
      company: { name: jd.companyName },
      rawText: `${jd.title} at ${jd.companyName}. ${jd.summary} Requirements: ${jd.skills.join(", ")}. Minimum CGPA: ${jd.minCgpa}.`,
      requirements: {
        technicalSkills: jd.skills,
        preferredSkills: ["Docker", "Kubernetes", "CI/CD"],
        softSkills: ["Communication", "Problem Solving", "Ownership"],
      },
      education: { minimumDegree: "B.Tech / M.Tech / MCA", preferredFields: ["CS", "IT", "ECE"], minimumCGPA: jd.minCgpa },
      experience: { minimumYears: 0 },
      responsibilities: ["Build scalable services", "Write unit and integration tests", "Participate in design reviews"],
      aiAnalysis: { summary: jd.summary, difficultyLevel: "entry", importantKeywords: jd.skills },
    });

    // ChromaDB vector embedding
    await addDocument(CHROMA_COLLECTIONS.JOB_EMBEDDINGS, {
      id: `job-${job.id}`,
      document: `Job: ${jd.title} at ${jd.companyName}. Required Skills: ${jd.skills.join(", ")}. Minimum CGPA: ${jd.minCgpa}. Summary: ${jd.summary}`,
      metadata: { jobId: job.id, companyName: jd.companyName, title: jd.title },
    });
  }

  // 8. Create 3 Assessments with 10 Questions each (30 questions total)
  const assessmentConfigs = [
    {
      jobIndex: 0,
      title: "Core SDE Screening: DSA & System Concepts",
      questions: [
        { text: "What is the worst-case time complexity of QuickSort?", options: ["O(N log N)", "O(N^2)", "O(N)", "O(log N)"], correct: 1, diff: "EASY", skill: "Algorithms" },
        { text: "Which data structure uses LIFO (Last In First Out) ordering?", options: ["Queue", "Stack", "Priority Queue", "Linked List"], correct: 1, diff: "EASY", skill: "Data Structures" },
        { text: "What is the amortized time complexity of inserting into a Dynamic Array (ArrayList/vector)?", options: ["O(1)", "O(N)", "O(log N)", "O(N^2)"], correct: 0, diff: "MEDIUM", skill: "Data Structures" },
        { text: "Which traversal of a Binary Search Tree produces nodes in strictly sorted ascending order?", options: ["Pre-order", "In-order", "Post-order", "Level-order"], correct: 1, diff: "MEDIUM", skill: "Data Structures" },
        { text: "What technique does Dijkstra's shortest path algorithm employ?", options: ["Divide and Conquer", "Dynamic Programming", "Greedy Algorithm", "Backtracking"], correct: 2, diff: "MEDIUM", skill: "Algorithms" },
        { text: "In distributed systems, what does the CAP theorem state is impossible during network partitions?", options: ["Both Consistency and Availability", "Both Speed and Storage", "Both Redundancy and Recovery", "Both Logging and Monitoring"], correct: 0, diff: "HARD", skill: "System Design" },
        { text: "Which synchronization primitive prevents race conditions by allowing only one thread in a critical section?", options: ["Semaphore", "Mutex", "Atomic Spinlock", "Condition Variable"], correct: 1, diff: "HARD", skill: "Operating Systems" },
        { text: "What is the space complexity of Depth First Search on a tree of height H?", options: ["O(H)", "O(2^H)", "O(1)", "O(H^2)"], correct: 0, diff: "MEDIUM", skill: "Algorithms" },
        { text: "Which hashing collision resolution technique stores colliding elements in a linked list at the bucket index?", options: ["Linear Probing", "Quadratic Probing", "Chaining", "Double Hashing"], correct: 2, diff: "EASY", skill: "Data Structures" },
        { text: "What is the time complexity to find the median in an unsorted array of size N using QuickSelect on average?", options: ["O(N log N)", "O(N)", "O(log N)", "O(N^2)"], correct: 1, diff: "HARD", skill: "Algorithms" },
        { text: "Find the bug in this binary search implementation:\n\n```python\ndef binary_search(arr, target):\n    low = 0\n    high = len(arr)\n    while low < high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid\n        else:\n            high = mid\n    return -1\n```\nWhat occurs when target is greater than `arr[mid]`?", options: ["IndexError: list index out of range", "Potential infinite loop because low = mid fails to advance when high - low == 1", "arr[mid] is evaluated as None", "Function immediately returns 0"], correct: 1, diff: "MEDIUM", skill: "Algorithms" },
        { text: "What is printed to stdout when executing this C++ program?\n\n```cpp\n#include <iostream>\n#include <memory>\nstruct Node {\n    int val;\n    std::shared_ptr<Node> next;\n    ~Node() { std::cout << \"~Node \"; }\n};\nint main() {\n    auto a = std::make_shared<Node>();\n    auto b = std::make_shared<Node>();\n    a->next = b;\n    b->next = a;\n    return 0;\n}\n```", options: ["~Node ~Node ", "Nothing; destructors are never invoked due to circular shared_ptr references causing memory leak", "Segmentation fault", "~Node "], correct: 1, diff: "HARD", skill: "C++" },
        { text: "Consider recursive Fibonacci with Python's `@functools.lru_cache`:\n\n```python\nfrom functools import lru_cache\n@lru_cache(maxsize=None)\ndef fib(n: int) -> int:\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\nprint(fib(50))\n```\nWhat is the time complexity of evaluating `fib(N)` with this memoization cache?", options: ["O(2^N)", "O(N)", "O(N log N)", "O(N^2)"], correct: 1, diff: "EASY", skill: "Python" },
        { text: "In the optimal O(N) Two Pointer solution to the Container With Most Water problem:\n\n```python\ndef maxArea(height):\n    left, right = 0, len(height) - 1\n    max_water = 0\n    while left < right:\n        width = right - left\n        h = min(height[left], height[right])\n        max_water = max(max_water, width * h)\n        if height[left] < height[right]:\n            left += 1\n        else:\n            right -= 1\n    return max_water\n```\nWhy is the pointer with the smaller height shifted?", options: ["Moving the taller line only decreases width without any potential to increase height; only moving the shorter line can yield a larger area", "Shorter lines are stored in heap memory", "To avoid integer overflow", "To sort the heights array in place"], correct: 0, diff: "MEDIUM", skill: "Algorithms" },
        { text: "What guarantees does the `volatile` keyword provide for a variable in Java multi-threading?\n\n```java\npublic class WorkerFlag {\n    private volatile boolean isRunning = true;\n    public void stop() { isRunning = false; }\n    public boolean check() { return isRunning; }\n}\n```", options: ["Provides mutual exclusion locking across all synchronized blocks", "Guarantees memory visibility across CPU caches and prevents instruction reordering, but does NOT guarantee compound atomicity (like count++)", "Prevents the class instance from being garbage collected", "Forces single-threaded execution on the JVM"], correct: 1, diff: "HARD", skill: "Java" },
        { text: "What is the time and auxiliary space complexity of recursively inverting a binary tree with N nodes?\n\n```python\ndef invertTree(root):\n    if not root:\n        return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root\n```", options: ["O(N) time and O(H) call stack space, where H is the height of the tree", "O(N log N) time and O(1) space", "O(N^2) time and O(N) space", "O(log N) time and O(N) space"], correct: 0, diff: "EASY", skill: "Data Structures" },
        { text: "In a distributed caching cluster with Consistent Hashing (using a 360-degree hash ring and virtual nodes):\nWhat is the primary benefit when a cache node is added or removed?", options: ["Only K/N keys need to be remapped on average (where K is total keys and N is total servers), rather than almost all keys", "Read latency drops to exactly 0ms", "Hash collisions are mathematically prevented", "Keys are synchronously replicated to all nodes simultaneously"], correct: 0, diff: "HARD", skill: "System Design" },
        { text: "What is the output of the following C++ pointer arithmetic?\n\n```cpp\nint arr[] = {10, 20, 30, 40, 50};\nint *ptr = arr;\n*(ptr + 2) += 5;\nstd::cout << arr[2] << \" \" << *ptr;\n```", options: ["35 10", "30 15", "35 15", "30 10"], correct: 0, diff: "EASY", skill: "C++" },
        { text: "What is the space complexity of an iterative Breadth-First Search (BFS) on a balanced binary tree of N nodes?", options: ["O(N) in the worst case (at maximum leaf level N/2 nodes in queue)", "O(log N)", "O(1)", "O(N^2)"], correct: 0, diff: "MEDIUM", skill: "Algorithms" },
        { text: "What is the worst-case time complexity of inserting into a Min-Heap of size N?", options: ["O(log N)", "O(1)", "O(N)", "O(N log N)"], correct: 0, diff: "EASY", skill: "Data Structures" },
      ],
    },
    {
      jobIndex: 1,
      title: "Machine Learning & AI Engineering Fundamentals",
      questions: [
        { text: "What is the primary purpose of activation functions in neural networks?", options: ["Normalize weights", "Introduce non-linearity", "Prevent memory leaks", "Accelerate disk I/O"], correct: 1, diff: "EASY", skill: "Machine Learning" },
        { text: "Which metric is most informative when evaluating a highly imbalanced classification dataset?", options: ["Accuracy", "F1-Score / PR-AUC", "Mean Squared Error", "R-Squared"], correct: 1, diff: "MEDIUM", skill: "Machine Learning" },
        { text: "What phenomenon occurs when a model performs exceptionally well on training data but poorly on unseen test data?", options: ["Underfitting", "Overfitting", "Gradient Clipping", "Convergence"], correct: 1, diff: "EASY", skill: "Machine Learning" },
        { text: "Which regularizer penalizes weights by adding their absolute values (L1 norm) to the loss function?", options: ["Ridge", "Lasso", "Elastic Net", "Dropout"], correct: 1, diff: "MEDIUM", skill: "Machine Learning" },
        { text: "What mechanism is central to Transformer architectures (such as BERT and GPT)?", options: ["Self-Attention", "Recurrent LSTMs", "Max-Pooling", "Convolutional Kernels"], correct: 0, diff: "MEDIUM", skill: "Deep Learning" },
        { text: "How does Batch Normalization accelerate neural network training?", options: ["By zeroing small weights", "By reducing internal covariate shift across mini-batches", "By replacing matrix multiplication with additions", "By eliminating backpropagation"], correct: 1, diff: "HARD", skill: "Deep Learning" },
        { text: "What causes the Vanishing Gradient problem during deep neural network backpropagation?", options: ["Too large learning rate", "Repeated multiplication of small derivatives through saturating activations", "Too many hidden neurons", "Excessive GPU memory"], correct: 1, diff: "HARD", skill: "Deep Learning" },
        { text: "Which algorithm is an ensemble method that fits sequential trees to residual errors of previous trees?", options: ["Random Forest", "Gradient Boosted Decision Trees (GBDT)", "K-Means", "Naive Bayes"], correct: 1, diff: "MEDIUM", skill: "Machine Learning" },
        { text: "What is the cosine similarity between two identical non-zero vectors?", options: ["0", "0.5", "1.0", "-1.0"], correct: 2, diff: "EASY", skill: "Mathematics" },
        { text: "In vector databases like ChromaDB, what does HNSW index stand for?", options: ["Hierarchical Navigable Small World", "High Numerical Search Web", "Hybrid Node Switching Wire", "Hyper Network Scaled Weights"], correct: 0, diff: "HARD", skill: "Vector Databases" },
        { text: "What is the shape of tensor `c` after broadcasting in PyTorch?\n\n```python\nimport torch\na = torch.randn(32, 1, 128)\nb = torch.randn(1, 10, 128)\nc = a + b\n```", options: ["torch.Size([32, 10, 128])", "torch.Size([32, 11, 256])", "RuntimeError: shape mismatch", "torch.Size([32, 1, 128])"], correct: 0, diff: "EASY", skill: "PyTorch" },
        { text: "What is the difference between `A * B` and `A @ B` in NumPy for two 2D matrices `A` and `B`?\n\n```python\nimport numpy as np\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[2, 0], [1, 2]])\n```", options: ["A * B computes element-wise Hadamard product; A @ B computes matrix multiplication dot product", "Both compute identical matrix multiplication", "A @ B calculates matrix transpose", "A * B is deprecated syntax"], correct: 0, diff: "EASY", skill: "NumPy" },
        { text: "In Transformer self-attention, why is the dot product of Query and Key divided by `sqrt(d_k)`?\n\n```python\nscores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)\nattention_weights = torch.softmax(scores, dim=-1)\n```", options: ["To normalize embedding vectors to length 1", "For large d_k, dot products grow large, pushing softmax into regions with vanishing gradients; scaling stabilizes variance", "To halve GPU VRAM consumption", "To enforce causal masking during decoding"], correct: 1, diff: "HARD", skill: "Deep Learning" },
        { text: "Analyze this machine learning preprocessing workflow:\n\n```python\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.model_selection import train_test_split\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nX_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)\n```\nWhy is this considered flawed practice in production machine learning?", options: ["Causes Data Leakage: test set mean and variance leak into feature scaling before train/test splitting", "StandardScaler cannot scale 2D matrices", "train_test_split requires integer features only", "Causes overfitting to y labels"], correct: 0, diff: "MEDIUM", skill: "Machine Learning" },
        { text: "Given true label `y = [0, 1, 0]` and predicted softmax probabilities `p = [0.1, 0.7, 0.2]`:\nWhat is the Categorical Cross-Entropy Loss?\n\n```python\nloss = -sum(y_i * log(p_i))\n```", options: ["-log(0.7) ≈ 0.357", "0.0", "1.0", "-log(0.1) ≈ 2.302"], correct: 0, diff: "MEDIUM", skill: "Machine Learning" },
        { text: "In vector similarity search with ChromaDB:\n\n```python\nresults = collection.query(query_embeddings=[query_vector], n_results=5, include=['documents', 'metadatas', 'distances'])\n```\nWhen distance metric is configured as `cosine`, how is cosine similarity calculated from returned distance `d`?", options: ["cosine_similarity = 1 - d", "cosine_similarity = 1 / d", "cosine_similarity = d^2", "cosine_similarity = -d"], correct: 0, diff: "MEDIUM", skill: "Vector Databases" },
        { text: "What is the primary role of the `torch.no_grad()` context manager during PyTorch model inference?\n\n```python\nwith torch.no_grad():\n    predictions = model(input_tensor)\n```", options: ["Disables autograd gradient computation tracking, drastically reducing GPU memory and accelerating forward pass", "Freezes all model weights permanently to disk", "Converts FP32 weights to INT8 quantization", "Enables distributed multi-GPU data parallelism"], correct: 0, diff: "EASY", skill: "PyTorch" },
        { text: "Why is AdamW optimizer widely preferred over standard Adam with L2 regularization in modern LLM training?", options: ["AdamW decouples weight decay from the gradient update calculation, correctly applying decay directly to weights rather than modifying momentum", "AdamW does not use learning rate scheduling", "AdamW eliminates the need for backward pass", "AdamW runs exclusively on CPU cores"], correct: 0, diff: "HARD", skill: "Deep Learning" },
      ],
    },
    {
      jobIndex: 2,
      title: "Full-Stack Cloud & Web Engineering Assessment",
      questions: [
        { text: "Which HTTP status code signifies a resource was successfully created?", options: ["200 OK", "201 Created", "204 No Content", "301 Moved"], correct: 1, diff: "EASY", skill: "Web Development" },
        { text: "In PostgreSQL, what is the default index type created for primary keys?", options: ["Hash Index", "B-Tree Index", "GIN Index", "BRIN Index"], correct: 1, diff: "MEDIUM", skill: "PostgreSQL" },
        { text: "What React hook allows components to safely subscribe to browser DOM events and run cleanup code?", options: ["useState", "useEffect", "useMemo", "useId"], correct: 1, diff: "EASY", skill: "React" },
        { text: "What is the key advantage of Server-Side Rendering (SSR) in Next.js?", options: ["Zero server compute needed", "Faster First Contentful Paint & SEO-friendly HTML", "Eliminates need for any CSS", "Disables JavaScript in browser"], correct: 1, diff: "MEDIUM", skill: "Next.js" },
        { text: "In database design, which normal form eliminates transitive dependencies?", options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd (BCNF)"], correct: 2, diff: "MEDIUM", skill: "Databases" },
        { text: "What Docker instruction defines the default command executed when a container starts?", options: ["RUN", "CMD", "WORKDIR", "ENV"], correct: 1, diff: "EASY", skill: "Docker" },
        { text: "What is the purpose of a Database Connection Pool in high-throughput backend applications?", options: ["To automatically encrypt columns", "To reuse established database connections and avoid handshake overhead", "To replicate data to S3", "To prevent SQL injection automatically"], correct: 1, diff: "HARD", skill: "Backend Architecture" },
        { text: "Which JWT component is signed with a secret key to prevent tampering?", options: ["Header only", "Payload only", "Signature verifying Header + Payload", "Claims array"], correct: 2, diff: "MEDIUM", skill: "Security" },
        { text: "In TypeScript, what keyword is used to extract the return type of a function type?", options: ["typeof", "keyof", "ReturnType<T>", "infer"], correct: 2, diff: "MEDIUM", skill: "TypeScript" },
        { text: "What header is required on the server to permit cross-origin HTTP requests from client browsers?", options: ["Content-Security-Policy", "Access-Control-Allow-Origin", "X-Frame-Options", "Strict-Transport-Security"], correct: 1, diff: "HARD", skill: "Web Security" },
        { text: "What is the resolved TypeScript type of `UserRoles` in the following conditional type definition?\n\n```typescript\ntype ExtractRoles<T> = T extends { roles: infer R } ? R : never;\ntype AdminUser = { id: string; name: string; roles: (\"ADMIN\" | \"SUPERADMIN\")[]; };\ntype UserRoles = ExtractRoles<AdminUser>;\n```", options: ["(\"ADMIN\" | \"SUPERADMIN\")[]", "\"ADMIN\" | \"SUPERADMIN\"", "never", "string[]"], correct: 0, diff: "MEDIUM", skill: "TypeScript" },
        { text: "What will be the exact logged output when executing the following JavaScript code?\n\n```javascript\nconsole.log(\"A\");\nsetTimeout(() => { console.log(\"B\"); }, 0);\nPromise.resolve().then(() => { console.log(\"C\"); return Promise.resolve(\"D\"); }).then((res) => { console.log(res); });\nconsole.log(\"E\");\n```", options: ["A, E, C, D, B", "A, B, C, D, E", "A, E, B, C, D", "A, C, E, D, B"], correct: 0, diff: "HARD", skill: "JavaScript" },
        { text: "Consider the following React timer component:\n\n```javascript\nfunction Timer() {\n  const [seconds, setSeconds] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => { setSeconds(seconds + 1); }, 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <div>{seconds}</div>;\n}\n```\nWhat will be rendered after 3 seconds, and how should it be fixed?", options: ["Renders 3; no fix required", "Stuck at 1 due to stale closure; fix using setSeconds((prev) => prev + 1)", "Renders 0; fix by removing clearInterval", "Renders NaN; fix by removing empty dependency array"], correct: 1, diff: "MEDIUM", skill: "React" },
        { text: "What does the following SQL analytic query compute for each employee?\n\n```sql\nSELECT employee_id, department_id, salary,\n       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as salary_rank\nFROM employees;\n```", options: ["Company-wide salary rank without grouping by department", "Department-wise rank where tied salaries share ranks without skipping the next rank integer", "Cumulative department payroll percentage", "Median salary difference per department"], correct: 1, diff: "MEDIUM", skill: "SQL" },
        { text: "In Node.js backend services, why is stream pipeline preferred over chaining `.pipe()`?\n\n```javascript\nimport { pipeline } from \"stream\";\nimport fs from \"fs\";\nimport zlib from \"zlib\";\npipeline(fs.createReadStream(\"input.txt\"), zlib.createGzip(), fs.createWriteStream(\"input.txt.gz\"), (err) => { if (err) console.error(err); });\n```", options: ["pipeline enables multi-threaded CPU execution automatically", "pipeline properly destroys and closes all streams on error, preventing file descriptor leaks", "pipeline runs synchronously to prevent concurrency", ".pipe() cannot handle gzip streams"], correct: 1, diff: "HARD", skill: "Node.js" },
        { text: "Given a high-throughput table `notifications` with 10M rows where 98% of rows have `is_read = true`:\n\n```sql\nCREATE INDEX idx_unread_user_notifications ON notifications(user_id) WHERE is_read = false;\n```\nWhat is this index and what is its primary benefit?", options: ["Clustered Index; physically sorts table pages on disk", "Partial Index; drastically reduces index storage and buffer pool RAM by indexing only active unread rows", "Bitmap Index; prevents concurrent read locks", "Full-text Index; enables lexical parsing"], correct: 1, diff: "MEDIUM", skill: "PostgreSQL" },
        { text: "Analyze the following production Docker multi-stage build:\n\n```dockerfile\nFROM node:20-alpine AS deps\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nFROM gcr.io/distroless/nodejs20-debian12 AS runner\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY ./dist ./dist\nUSER nonroot\nCMD [\"dist/index.js\"]\n```\nWhy is the distroless image used in the final runtime stage?", options: ["It contains pre-installed Kubernetes daemon agents", "It strips package managers and shells, minimizing image footprint and container vulnerability attack surface", "It provides root SSH access for production debugging", "It automatically compiles TypeScript to native C++ machine binaries"], correct: 1, diff: "EASY", skill: "Docker" },
        { text: "Examine the following custom debounce hook in React:\n\n```typescript\nfunction useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {\n  const timerRef = useRef<NodeJS.Timeout | null>(null);\n  return useCallback((...args: Parameters<T>) => {\n    if (timerRef.current) clearTimeout(timerRef.current);\n    timerRef.current = setTimeout(() => { fn(...args); }, delay);\n  }, [fn, delay]);\n}\n```\nWhy is `useRef` used for `timerRef` rather than `useState`?", options: ["useState cannot store timer objects", "Mutating useRef persists values across renders without triggering extraneous component re-renders", "useRef executes inside a background Web Worker", "useState requires async await syntax inside callbacks"], correct: 1, diff: "EASY", skill: "React" },
        { text: "A client sends repeated requests with an `Idempotency-Key` header:\n\n```http\nPOST /api/v1/payments HTTP/1.1\nIdempotency-Key: 7b9a8f4c-1234-5678-abcd-ef0123456789\n{\"amount\": 5000, \"currency\": \"INR\"}\n```\nWhat should the server respond if a duplicate request arrives while the original is still in-flight?", options: ["200 OK with fabricated mock data", "409 Conflict indicating concurrent in-progress processing for the specified idempotency key", "500 Internal Server Error", "Execute an immediate duplicate payment"], correct: 1, diff: "HARD", skill: "Backend Architecture" },
        { text: "What is the memory difference between expressions A and B in Python?\n\n```python\n# Expression A\nsquares_list = [x ** 2 for x in range(10_000_000)]\n# Expression B\nsquares_gen = (x ** 2 for x in range(10_000_000))\n```", options: ["A allocates ~80MB+ RAM holding all items; B evaluates lazily yielding items on-demand using O(1) memory", "Both allocate identical heap memory in modern Python", "Expression B raises a SyntaxError", "Expression A executes on GPU whereas B executes on CPU"], correct: 0, diff: "EASY", skill: "Python" },
        { text: "Given the TypeScript type utility below:\n\n```typescript\ntype UnwrapPromise<T> = T extends Promise<infer U> ? U : T;\ntype Data = UnwrapPromise<Promise<{ id: number; username: string }>>;\n```\nWhat is the resolved type of `Data`?", options: ["{ id: number; username: string }", "Promise<{ id: number; username: string }>", "unknown", "void"], correct: 0, diff: "EASY", skill: "TypeScript" },
        { text: "Inspect the following backend caching pattern:\n\n```typescript\nasync function getUser(id: string) {\n  const cached = await redis.get(`user:${id}`);\n  if (cached) return JSON.parse(cached);\n  const user = await db.user.findUnique({ where: { id } });\n  if (user) { await redis.setex(`user:${id}`, 3600, JSON.stringify(user)); }\n  return user;\n}\n```\nWhich caching strategy is implemented here?", options: ["Write-Through Cache", "Cache-Aside (Lazy Loading)", "Write-Behind (Write-Back) Cache", "Refresh-Ahead Cache"], correct: 1, diff: "EASY", skill: "Backend Architecture" },
        { text: "Under ANSI SQL, what anomaly can occur under REPEATABLE READ that is prevented by SERIALIZABLE?\n\n```sql\n-- Session A\nSELECT count(*) FROM users WHERE status = 'PENDING';\n-- Session B concurrently inserts a new user with status = 'PENDING' and commits\n-- Session A repeats query\nSELECT count(*) FROM users WHERE status = 'PENDING';\n```", options: ["Dirty Read", "Phantom Read (new qualifying rows appearing in range query)", "Lost Update", "Non-Repeatable Read"], correct: 1, diff: "HARD", skill: "SQL" },
        { text: "What is the purpose of the Next.js `revalidatePath` function in Server Actions?\n\n```typescript\n'use server';\nimport { revalidatePath } from 'next/cache';\nexport async function createPost(formData: FormData) {\n  await db.post.create({ data: { title: formData.get('title') as string } });\n  revalidatePath('/feed');\n}\n```", options: ["Reloads the client browser window via location.reload()", "Purges cached Data Cache / RSC entries for the route so fresh server HTML is rendered", "Deletes database records permanently", "Clears all user session cookies"], correct: 1, diff: "MEDIUM", skill: "Next.js" },
        { text: "What bug occurs with unhandled Promise rejections in Node.js 16+?\n\n```javascript\nasync function processBatch() {\n  Promise.reject(new Error(\"Fatal connection timeout\"));\n}\nprocessBatch();\n```", options: ["The promise is silently swallowed without logging", "Node.js terminates the process with non-zero exit code due to unhandledRejection", "The process restarts automatically in infinite loop", "Garbage collection pauses all I/O threads"], correct: 1, diff: "HARD", skill: "Node.js" },
      ],
    },
  ];

  const createdAssessments = [];

  for (const ac of assessmentConfigs) {
    const job = createdJobs[ac.jobIndex];
    const assessment = await prisma.assessment.create({
      data: {
        jobId: job.id,
        title: ac.title,
        durationMinutes: 20,
        passingScore: 70.0,
        totalQuestions: ac.questions.length,
      },
    });

    createdAssessments.push(assessment);

    for (const q of ac.questions) {
      await prisma.question.create({
        data: {
          assessmentId: assessment.id,
          text: q.text,
          options: JSON.stringify(q.options),
          correctOption: q.correct,
          difficulty: q.diff as DifficultyLevel,
          skill: q.skill,
          topic: "Core Engineering Concepts",
          status: "APPROVED",
        },
      });
    }
  }

  // 9. Create Sample Applications with Hybrid Match Scores
  const app1 = await prisma.application.create({
    data: {
      jobId: createdJobs[0].id,
      studentId: createdStudents[0].id, // Alex Sharma
      matchScore: 86.0,
      status: "INTERVIEW_SCHEDULED",
      aiRecommended: true,
      humanReviewed: true,
      notes: "Strong candidate fit. Approved by TPO Dr. Verma.",
    },
  });

  const app2 = await prisma.application.create({
    data: {
      jobId: createdJobs[1].id,
      studentId: createdStudents[1].id, // Priya Patel
      matchScore: 92.0,
      status: "OFFERED",
      aiRecommended: true,
      humanReviewed: true,
      notes: "Exceptional ML research background and 9.15 CGPA.",
    },
  });

  const app3 = await prisma.application.create({
    data: {
      jobId: createdJobs[2].id,
      studentId: createdStudents[2].id, // Rohan Gupta
      matchScore: 74.0,
      status: "ASSESSMENT_COMPLETED",
      aiRecommended: true,
      humanReviewed: false,
    },
  });

  // 10. Sample Assessment Attempt
  const attempt1 = await prisma.assessmentAttempt.create({
    data: {
      assessmentId: createdAssessments[0].id,
      studentId: createdStudents[0].id,
      score: 85.0,
      status: "COMPLETED",
      currentDifficulty: "HARD",
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 2400000),
    },
  });

  // 11. Sample Interview Session & Evaluation
  const interviewSession = await prisma.interviewSession.create({
    data: {
      applicationId: app1.id,
      studentId: createdStudents[0].id,
      status: "COMPLETED",
      scheduledAt: new Date(Date.now() - 7200000),
      completedAt: new Date(Date.now() - 5400000),
    },
  });

  await prisma.interviewEvaluation.create({
    data: {
      sessionId: interviewSession.id,
      overallScore: 84.0,
      technicalScore: 86.0,
      problemSolvingScore: 82.0,
      communicationScore: 85.0,
      roleRelevanceScore: 84.0,
      decision: "HIRE",
    },
  });

  // MongoDB interview transcript
  const mongoTranscripts = await getMongoCollection(COLLECTIONS.INTERVIEW_TRANSCRIPTS);
  await mongoTranscripts.insertOne({
    sessionId: interviewSession.id,
    messages: [
      { role: "assistant", content: "Welcome Alex! Could you introduce yourself and tell us about your experience with distributed systems?", timestamp: new Date().toISOString() },
      { role: "user", content: "Hello! I am a final-year CS student. I've built scalable backend services in Python and Node.js, and designed a caching architecture using Redis and PostgreSQL that reduced query latency by 35%.", timestamp: new Date().toISOString() },
      { role: "assistant", content: "Great! How did you address cache invalidation when data was updated frequently?", timestamp: new Date().toISOString() },
      { role: "user", content: "We used a write-through cache strategy with TTLs and published invalidation events over a lightweight message channel to keep cache entries consistent.", timestamp: new Date().toISOString() },
    ],
  });

  // 12. Sample Agent Execution Logs in MongoDB
  const mongoAgentRuns = await getMongoCollection(COLLECTIONS.AGENT_RUNS);
  await mongoAgentRuns.insertOne({
    agent: "resume-analysis-agent",
    entityId: createdStudents[0].id,
    status: "completed",
    startedAt: new Date(Date.now() - 10000000).toISOString(),
    completedAt: new Date(Date.now() - 9998000).toISOString(),
    model: "gemini-1.5-flash",
    retrievalSources: ["Resume_CS2025001.pdf"],
    result: { qualityScore: 88, skillsIdentified: 8 },
    error: null,
  });

  await mongoAgentRuns.insertOne({
    agent: "candidate-matching-agent",
    entityId: app1.id,
    status: "completed",
    startedAt: new Date(Date.now() - 8000000).toISOString(),
    completedAt: new Date(Date.now() - 7995000).toISOString(),
    model: "gemini-1.5-flash",
    retrievalSources: [`resume-${createdStudents[0].id}`, `job-${createdJobs[0].id}`],
    result: { overallMatchScore: 86, recommendation: "Strong Match" },
    error: null,
  });

  // 13. Notifications & Announcements
  await prisma.notification.create({
    data: {
      userId: createdStudents[0].userId,
      title: "Interview Shortlist Announcement",
      message: "Congratulations! You have been shortlisted for the technical interview round at Google.",
      type: "SUCCESS",
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "New Job Published",
      message: "Microsoft Azure Full Stack Engineer position is now live for eligible students.",
      type: "INFO",
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Campus Placement Season 2025 Kickoff",
      content: "All eligible final-year students must ensure their resumes and profiles are 100% complete. AI resume scoring and screening rounds begin this week.",
      category: "PLACEMENT_DRIVE",
      targetAudience: "ALL",
    },
  });

  // 14. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "JOB_APPROVAL",
      entityType: "JOB",
      entityId: createdJobs[0].id,
      details: JSON.stringify({ title: createdJobs[0].title, company: "Google" }),
      ipAddress: "127.0.0.1",
    },
  });

  console.log("Polyglot seed completed successfully!");
  console.log("Sample Logins:");
  console.log("Admin: admin@placement.edu | Placement@123");
  console.log("Recruiter: sarah.recruiter@google.com | Placement@123");
  console.log("Student: student1@placement.edu | Placement@123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
