import { PrismaClient, DifficultyLevel } from "@prisma/client";

const prisma = new PrismaClient();

interface NewQuestion {
  text: string;
  options: string[];
  correct: number;
  diff: "EASY" | "MEDIUM" | "HARD";
  skill: string;
  topic: string;
}

const fullStackQuestions: NewQuestion[] = [
  {
    text: `What is the resolved TypeScript type of \`UserRoles\` in the following conditional type definition?

\`\`\`typescript
type ExtractRoles<T> = T extends { roles: infer R } ? R : never;

type AdminUser = {
  id: string;
  name: string;
  roles: ("ADMIN" | "SUPERADMIN")[];
};

type UserRoles = ExtractRoles<AdminUser>;
\`\`\``,
    options: [
      '("ADMIN" | "SUPERADMIN")[]',
      '"ADMIN" | "SUPERADMIN"',
      "never",
      "string[]",
    ],
    correct: 0,
    diff: "MEDIUM",
    skill: "TypeScript",
    topic: "Type Inference & Generics",
  },
  {
    text: `What will be the exact logged output when executing the following JavaScript code?

\`\`\`javascript
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
  return Promise.resolve("D");
}).then((res) => {
  console.log(res);
});

console.log("E");
\`\`\``,
    options: ["A, E, C, D, B", "A, B, C, D, E", "A, E, B, C, D", "A, C, E, D, B"],
    correct: 0,
    diff: "HARD",
    skill: "JavaScript",
    topic: "Event Loop & Microtasks",
  },
  {
    text: `Consider the following React timer component:

\`\`\`javascript
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>{seconds}</div>;
}
\`\`\`
What will be rendered after 3 seconds, and how should it be fixed?`,
    options: [
      "Renders 3; no fix required",
      "Stuck at 1 due to stale closure; fix using setSeconds((prev) => prev + 1)",
      "Renders 0; fix by removing clearInterval",
      "Renders NaN; fix by removing empty dependency array",
    ],
    correct: 1,
    diff: "MEDIUM",
    skill: "React",
    topic: "State Hooks & Closures",
  },
  {
    text: `What does the following SQL analytic query compute for each employee?

\`\`\`sql
SELECT employee_id, department_id, salary,
       DENSE_RANK() OVER (
         PARTITION BY department_id 
         ORDER BY salary DESC
       ) as salary_rank
FROM employees;
\`\`\``,
    options: [
      "Company-wide salary rank without grouping by department",
      "Department-wise rank where tied salaries share ranks without skipping the next rank integer",
      "Cumulative department payroll percentage",
      "Median salary difference per department",
    ],
    correct: 1,
    diff: "MEDIUM",
    skill: "SQL",
    topic: "Window Functions",
  },
  {
    text: `In Node.js backend services, why is stream pipeline preferred over chaining \`.pipe()\`?

\`\`\`javascript
import { pipeline } from "stream";
import fs from "fs";
import zlib from "zlib";

pipeline(
  fs.createReadStream("input.txt"),
  zlib.createGzip(),
  fs.createWriteStream("input.txt.gz"),
  (err) => {
    if (err) console.error("Pipeline failed", err);
  }
);
\`\`\``,
    options: [
      "pipeline enables multi-threaded CPU execution automatically",
      "pipeline properly destroys and closes all streams on error, preventing file descriptor leaks",
      "pipeline runs synchronously to prevent concurrency",
      ".pipe() cannot handle gzip streams",
    ],
    correct: 1,
    diff: "HARD",
    skill: "Node.js",
    topic: "Streams & Resource Management",
  },
  {
    text: `Given a high-throughput table \`notifications\` with 10M rows where 98% of rows have \`is_read = true\`:

\`\`\`sql
CREATE INDEX idx_unread_user_notifications 
ON notifications(user_id) 
WHERE is_read = false;
\`\`\`
What is this index and what is its primary benefit?`,
    options: [
      "Clustered Index; physically sorts table pages on disk",
      "Partial Index; drastically reduces index storage and buffer pool RAM by indexing only active unread rows",
      "Bitmap Index; prevents concurrent read locks",
      "Full-text Index; enables lexical parsing",
    ],
    correct: 1,
    diff: "MEDIUM",
    skill: "PostgreSQL",
    topic: "Partial Indexes",
  },
  {
    text: `Analyze the following production Docker multi-stage build:

\`\`\`dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ./dist ./dist
USER nonroot
CMD ["dist/index.js"]
\`\`\`
Why is the distroless image used in the final runtime stage?`,
    options: [
      "It contains pre-installed Kubernetes daemon agents",
      "It strips package managers and shells, minimizing image footprint and container vulnerability attack surface",
      "It provides root SSH access for production debugging",
      "It automatically compiles TypeScript to native C++ machine binaries",
    ],
    correct: 1,
    diff: "EASY",
    skill: "Docker",
    topic: "Container Security",
  },
  {
    text: `Examine the following custom debounce hook in React:

\`\`\`typescript
function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay]);
}
\`\`\`
Why is \`useRef\` used for \`timerRef\` rather than \`useState\`?`,
    options: [
      "useState cannot store timer objects",
      "Mutating useRef persists values across renders without triggering extraneous component re-renders",
      "useRef executes inside a background Web Worker",
      "useState requires async await syntax inside callbacks",
    ],
    correct: 1,
    diff: "EASY",
    skill: "React",
    topic: "Hooks & Performance",
  },
  {
    text: `A client sends repeated requests with an \`Idempotency-Key\` header:

\`\`\`http
POST /api/v1/payments HTTP/1.1
Host: api.stripe.com
Idempotency-Key: 7b9a8f4c-1234-5678-abcd-ef0123456789
Content-Type: application/json

{"amount": 5000, "currency": "INR"}
\`\`\`
What should the server respond if a duplicate request arrives while the original is still in-flight?`,
    options: [
      "200 OK with fabricated mock data",
      "409 Conflict indicating concurrent in-progress processing for the specified idempotency key",
      "500 Internal Server Error",
      "Execute an immediate duplicate payment",
    ],
    correct: 1,
    diff: "HARD",
    skill: "Backend Architecture",
    topic: "Idempotency & Distributed Systems",
  },
  {
    text: `What is the memory difference between expressions A and B in Python?

\`\`\`python
# Expression A
squares_list = [x ** 2 for x in range(10_000_000)]

# Expression B
squares_gen = (x ** 2 for x in range(10_000_000))
\`\`\``,
    options: [
      "A allocates ~80MB+ RAM holding all items; B evaluates lazily yielding items on-demand using O(1) memory",
      "Both allocate identical heap memory in modern Python",
      "Expression B raises a SyntaxError",
      "Expression A executes on GPU whereas B executes on CPU",
    ],
    correct: 0,
    diff: "EASY",
    skill: "Python",
    topic: "Generators & Memory Optimization",
  },
  {
    text: `Given the TypeScript type utility below:

\`\`\`typescript
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type Data = UnwrapPromise<Promise<{ id: number; username: string }>>;
\`\`\`
What is the resolved type of \`Data\`?`,
    options: [
      "{ id: number; username: string }",
      "Promise<{ id: number; username: string }>",
      "unknown",
      "void",
    ],
    correct: 0,
    diff: "EASY",
    skill: "TypeScript",
    topic: "Conditional Types",
  },
  {
    text: `Inspect the following backend caching pattern:

\`\`\`typescript
async function getUser(id: string) {
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached);

  const user = await db.user.findUnique({ where: { id } });
  if (user) {
    await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user));
  }
  return user;
}
\`\`\`
Which caching strategy is implemented here?`,
    options: [
      "Write-Through Cache",
      "Cache-Aside (Lazy Loading)",
      "Write-Behind (Write-Back) Cache",
      "Refresh-Ahead Cache",
    ],
    correct: 1,
    diff: "EASY",
    skill: "Backend Architecture",
    topic: "Caching Strategies",
  },
  {
    text: `Under ANSI SQL, what anomaly can occur under REPEATABLE READ that is prevented by SERIALIZABLE?

\`\`\`sql
-- Session A
SELECT count(*) FROM users WHERE status = 'PENDING';
-- Session B concurrently inserts a new user with status = 'PENDING' and commits
-- Session A repeats query
SELECT count(*) FROM users WHERE status = 'PENDING';
\`\`\``,
    options: [
      "Dirty Read",
      "Phantom Read (new qualifying rows appearing in range query)",
      "Lost Update",
      "Non-Repeatable Read",
    ],
    correct: 1,
    diff: "HARD",
    skill: "SQL",
    topic: "Transaction Isolation",
  },
  {
    text: `What is the purpose of the Next.js \`revalidatePath\` function in Server Actions?

\`\`\`typescript
'use server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  await db.post.create({ data: { title: formData.get('title') as string } });
  revalidatePath('/feed');
}
\`\`\``,
    options: [
      "Reloads the client browser window via location.reload()",
      "Purges cached Data Cache / RSC entries for the route so fresh server HTML is rendered",
      "Deletes database records permanently",
      "Clears all user session cookies",
    ],
    correct: 1,
    diff: "MEDIUM",
    skill: "Next.js",
    topic: "Server Actions & Caching",
  },
  {
    text: `What bug occurs with unhandled Promise rejections in Node.js 16+?

\`\`\`javascript
async function processBatch() {
  Promise.reject(new Error("Fatal connection timeout"));
}
processBatch();
\`\`\``,
    options: [
      "The promise is silently swallowed without logging",
      "Node.js terminates the process with non-zero exit code due to unhandledRejection",
      "The process restarts automatically in infinite loop",
      "Garbage collection pauses all I/O threads",
    ],
    correct: 1,
    diff: "HARD",
    skill: "Node.js",
    topic: "Error Handling & Process Lifecycle",
  },
];

const coreSdeQuestions: NewQuestion[] = [
  {
    text: `Find the bug in this binary search implementation:

\`\`\`python
def binary_search(arr, target):
    low = 0
    high = len(arr)
    while low < high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid
        else:
            high = mid
    return -1
\`\`\`
What occurs when target is greater than \`arr[mid]\`?`,
    options: [
      "IndexError: list index out of range",
      "Potential infinite loop because low = mid fails to advance when high - low == 1",
      "arr[mid] is evaluated as None",
      "Function immediately returns 0",
    ],
    correct: 1,
    diff: "MEDIUM",
    skill: "Algorithms",
    topic: "Binary Search",
  },
  {
    text: `What is printed to stdout when executing this C++ program?

\`\`\`cpp
#include <iostream>
#include <memory>

struct Node {
    int val;
    std::shared_ptr<Node> next;
    ~Node() { std::cout << "~Node "; }
};

int main() {
    auto a = std::make_shared<Node>();
    auto b = std::make_shared<Node>();
    a->next = b;
    b->next = a; // cyclic reference
    return 0;
}
\`\`\``,
    options: [
      "~Node ~Node ",
      "Nothing; destructors are never invoked due to circular shared_ptr references causing memory leak",
      "Segmentation fault",
      "~Node ",
    ],
    correct: 1,
    diff: "HARD",
    skill: "C++",
    topic: "Smart Pointers & Memory Management",
  },
  {
    text: `Consider recursive Fibonacci with Python's \`@functools.lru_cache\`:

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(50))
\`\`\`
What is the time complexity of evaluating \`fib(N)\` with this memoization cache?`,
    options: ["O(2^N)", "O(N)", "O(N log N)", "O(N^2)"],
    correct: 1,
    diff: "EASY",
    skill: "Python",
    topic: "Dynamic Programming",
  },
  {
    text: `In the optimal O(N) Two Pointer solution to the Container With Most Water problem:

\`\`\`python
def maxArea(height):
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water
\`\`\`
Why is the pointer with the smaller height shifted?`,
    options: [
      "Moving the taller line only decreases width without any potential to increase height; only moving the shorter line can yield a larger area",
      "Shorter lines are stored in heap memory",
      "To avoid integer overflow",
      "To sort the heights array in place",
    ],
    correct: 0,
    diff: "MEDIUM",
    skill: "Algorithms",
    topic: "Two Pointers",
  },
  {
    text: `What guarantees does the \`volatile\` keyword provide for a variable in Java multi-threading?

\`\`\`java
public class WorkerFlag {
    private volatile boolean isRunning = true;
    public void stop() { isRunning = false; }
    public boolean check() { return isRunning; }
}
\`\`\``,
    options: [
      "Provides mutual exclusion locking across all synchronized blocks",
      "Guarantees memory visibility across CPU caches and prevents instruction reordering, but does NOT guarantee compound atomicity (like count++)",
      "Prevents the class instance from being garbage collected",
      "Forces single-threaded execution on the JVM",
    ],
    correct: 1,
    diff: "HARD",
    skill: "Java",
    topic: "Concurrency & Memory Model",
  },
  {
    text: `What is the time and auxiliary space complexity of recursively inverting a binary tree with N nodes?

\`\`\`python
def invertTree(root):
    if not root:
        return None
    root.left, root.right = invertTree(root.right), invertTree(root.left)
    return root
\`\`\``,
    options: [
      "O(N) time and O(H) call stack space, where H is the height of the tree",
      "O(N log N) time and O(1) space",
      "O(N^2) time and O(N) space",
      "O(log N) time and O(N) space",
    ],
    correct: 0,
    diff: "EASY",
    skill: "Data Structures",
    topic: "Binary Trees",
  },
  {
    text: `In a distributed caching cluster with Consistent Hashing (using a 360-degree hash ring and virtual nodes):
What is the primary benefit when a cache node is added or removed?`,
    options: [
      "Only K/N keys need to be remapped on average (where K is total keys and N is total servers), rather than almost all keys",
      "Read latency drops to exactly 0ms",
      "Hash collisions are mathematically prevented",
      "Keys are synchronously replicated to all nodes simultaneously",
    ],
    correct: 0,
    diff: "HARD",
    skill: "System Design",
    topic: "Consistent Hashing",
  },
  {
    text: `What is the output of the following C++ pointer arithmetic?

\`\`\`cpp
int arr[] = {10, 20, 30, 40, 50};
int *ptr = arr;
*(ptr + 2) += 5;
std::cout << arr[2] << " " << *ptr;
\`\`\``,
    options: ["35 10", "30 15", "35 15", "30 10"],
    correct: 0,
    diff: "EASY",
    skill: "C++",
    topic: "Pointers & Arrays",
  },
  {
    text: `What is the space complexity of an iterative Breadth-First Search (BFS) on a balanced binary tree of N nodes?`,
    options: [
      "O(N) in the worst case (at maximum leaf level N/2 nodes in queue)",
      "O(log N)",
      "O(1)",
      "O(N^2)",
    ],
    correct: 0,
    diff: "MEDIUM",
    skill: "Algorithms",
    topic: "Tree Traversals",
  },
  {
    text: `What is the worst-case time complexity of inserting into a Min-Heap of size N?`,
    options: ["O(log N)", "O(1)", "O(N)", "O(N log N)"],
    correct: 0,
    diff: "EASY",
    skill: "Data Structures",
    topic: "Heaps & Priority Queues",
  },
];

const mlAiQuestions: NewQuestion[] = [
  {
    text: `What is the shape of tensor \`c\` after broadcasting in PyTorch?

\`\`\`python
import torch

a = torch.randn(32, 1, 128)
b = torch.randn(1, 10, 128)
c = a + b
\`\`\``,
    options: [
      "torch.Size([32, 10, 128])",
      "torch.Size([32, 11, 256])",
      "RuntimeError: shape mismatch",
      "torch.Size([32, 1, 128])",
    ],
    correct: 0,
    diff: "EASY",
    skill: "PyTorch",
    topic: "Tensor Broadcasting",
  },
  {
    text: `What is the difference between \`A * B\` and \`A @ B\` in NumPy for two 2D matrices \`A\` and \`B\`?

\`\`\`python
import numpy as np
A = np.array([[1, 2], [3, 4]])
B = np.array([[2, 0], [1, 2]])
\`\`\``,
    options: [
      "A * B computes element-wise Hadamard product; A @ B computes matrix multiplication dot product",
      "Both compute identical matrix multiplication",
      "A @ B calculates matrix transpose",
      "A * B is deprecated syntax",
    ],
    correct: 0,
    diff: "EASY",
    skill: "NumPy",
    topic: "Linear Algebra",
  },
  {
    text: `In Transformer self-attention, why is the dot product of Query and Key divided by \`sqrt(d_k)\`?

\`\`\`python
scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
attention_weights = torch.softmax(scores, dim=-1)
\`\`\``,
    options: [
      "To normalize embedding vectors to length 1",
      "For large d_k, dot products grow large, pushing softmax into regions with vanishing gradients; scaling stabilizes variance",
      "To halve GPU VRAM consumption",
      "To enforce causal masking during decoding",
    ],
    correct: 1,
    diff: "HARD",
    skill: "Deep Learning",
    topic: "Transformers & Attention Mechanism",
  },
  {
    text: `Analyze this machine learning preprocessing workflow:

\`\`\`python
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)
\`\`\`
Why is this considered flawed practice in production machine learning?`,
    options: [
      "Causes Data Leakage: test set mean and variance leak into feature scaling before train/test splitting",
      "StandardScaler cannot scale 2D matrices",
      "train_test_split requires integer features only",
      "Causes overfitting to y labels",
    ],
    correct: 0,
    diff: "MEDIUM",
    skill: "Machine Learning",
    topic: "Data Leakage & Preprocessing",
  },
  {
    text: `Given true label \`y = [0, 1, 0]\` and predicted softmax probabilities \`p = [0.1, 0.7, 0.2]\`:
What is the Categorical Cross-Entropy Loss?

\`\`\`python
loss = -sum(y_i * log(p_i))
\`\`\``,
    options: [
      "-log(0.7) ≈ 0.357",
      "0.0",
      "1.0",
      "-log(0.1) ≈ 2.302",
    ],
    correct: 0,
    diff: "MEDIUM",
    skill: "Machine Learning",
    topic: "Loss Functions",
  },
  {
    text: `In vector similarity search with ChromaDB:

\`\`\`python
results = collection.query(
    query_embeddings=[query_vector],
    n_results=5,
    include=["documents", "metadatas", "distances"]
)
\`\`\`
When the distance metric is configured as \`cosine\`, how is cosine similarity calculated from returned distance \`d\`?`,
    options: [
      "cosine_similarity = 1 - d",
      "cosine_similarity = 1 / d",
      "cosine_similarity = d^2",
      "cosine_similarity = -d",
    ],
    correct: 0,
    diff: "MEDIUM",
    skill: "Vector Databases",
    topic: "Similarity Metrics",
  },
  {
    text: `What is the primary role of the \`torch.no_grad()\` context manager during PyTorch model inference?

\`\`\`python
with torch.no_grad():
    predictions = model(input_tensor)
\`\`\``,
    options: [
      "Disables autograd gradient computation tracking, drastically reducing GPU memory and accelerating forward pass",
      "Freezes all model weights permanently to disk",
      "Converts FP32 weights to INT8 quantization",
      "Enables distributed multi-GPU data parallelism",
    ],
    correct: 0,
    diff: "EASY",
    skill: "PyTorch",
    topic: "Performance & Autograd",
  },
  {
    text: `Why is AdamW optimizer widely preferred over standard Adam with L2 regularization in modern LLM training?`,
    options: [
      "AdamW decouples weight decay from the gradient update calculation, correctly applying decay directly to weights rather than modifying momentum",
      "AdamW does not use learning rate scheduling",
      "AdamW eliminates the need for backward pass",
      "AdamW runs exclusively on CPU cores",
    ],
    correct: 0,
    diff: "HARD",
    skill: "Deep Learning",
    topic: "Optimization Algorithms",
  },
];

async function main() {
  console.log("Adding programming and advanced questions to assessments...");

  const assessments = await prisma.assessment.findMany({
    select: { id: true, title: true },
  });

  for (const test of assessments) {
    let questionsToAdd: NewQuestion[] = [];
    if (test.title.includes("Full-Stack")) {
      questionsToAdd = fullStackQuestions;
    } else if (test.title.includes("Core SDE") || test.title.includes("DSA")) {
      questionsToAdd = coreSdeQuestions;
    } else if (test.title.includes("Machine Learning") || test.title.includes("AI")) {
      questionsToAdd = mlAiQuestions;
    }

    console.log(`Processing assessment: "${test.title}" (ID: ${test.id})`);

    let addedCount = 0;
    for (const q of questionsToAdd) {
      // Check if question already exists to prevent duplicate insertion
      const existing = await prisma.question.findFirst({
        where: {
          assessmentId: test.id,
          text: q.text,
        },
      });

      if (!existing) {
        await prisma.question.create({
          data: {
            assessmentId: test.id,
            text: q.text,
            options: JSON.stringify(q.options),
            correctOption: q.correct,
            difficulty: q.diff as DifficultyLevel,
            skill: q.skill,
            topic: q.topic,
            status: "APPROVED",
          },
        });
        addedCount++;
      }
    }

    const totalCount = await prisma.question.count({
      where: { assessmentId: test.id, status: "APPROVED" },
    });

    await prisma.assessment.update({
      where: { id: test.id },
      data: { totalQuestions: totalCount },
    });

    console.log(`Added ${addedCount} questions. New total for "${test.title}": ${totalCount}`);
  }

  console.log("Questions successfully populated!");
}

main()
  .catch((e) => {
    console.error("Error populating questions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
