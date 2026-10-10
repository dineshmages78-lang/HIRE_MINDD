const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public', 'sample-resumes');
fs.mkdirSync(dir, { recursive: true });

function createSimplePdf(textLines) {
  const contentStream = textLines.map((line, i) => {
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    return '1 0 0 1 50 ' + (750 - i * 18) + ' Tm (' + escaped + ') Tj';
  }).join('\n');

  const streamLength = Buffer.byteLength(contentStream);

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj',
    '4 0 obj\n<< /Length ' + streamLength + ' >>\nstream\nBT\n/F1 10 Tf\n' + contentStream + '\nET\nendstream\nendobj',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj'
  ];

  let offset = 9;
  const xref = ['xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f '];

  let body = '%PDF-1.4\n';
  for (let i = 0; i < objects.length; i++) {
    xref.push(String(offset).padStart(10, '0') + ' 00000 n ');
    body += objects[i] + '\n';
    offset = Buffer.byteLength(body);
  }

  const startxref = offset;
  const trailer = 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n';
  return body + xref.join('\n') + '\n' + trailer;
}

const resumeLines = [
  'Alex Sharma',
  'Email: alex.sharma@example.edu | Phone: +91 98765 43210 | Location: New Delhi, India',
  'GitHub: github.com/alexsharma | LinkedIn: linkedin.com/in/alexsharma',
  '',
  'PROFESSIONAL SUMMARY',
  'Final-year Computer Science Engineering student with strong hands-on experience in full-stack',
  'web development, distributed systems, machine learning, and cloud infrastructure.',
  '',
  'TECHNICAL SKILLS',
  'Programming Languages: Python, TypeScript, JavaScript, Java, C++, SQL, Go',
  'Frameworks & Libraries: React, Next.js, Node.js, Express, FastAPI, Django, Tailwind CSS',
  'Databases & Storage: PostgreSQL, MongoDB, Redis, MySQL',
  'Cloud & DevOps: Docker, Kubernetes, AWS, Git, GitHub Actions, Linux, CI/CD',
  'AI & Machine Learning: PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy',
  '',
  'EDUCATION',
  'Bachelor of Technology in Computer Science & Engineering',
  'National Institute of Technology (2021 - 2025) | CGPA: 8.65 / 10.0',
  '',
  'WORK EXPERIENCE',
  'Software Engineering Intern | TechNexus Solutions (June 2024 - August 2024)',
  '- Architected scalable RESTful microservices in Node.js and PostgreSQL serving 15,000+ daily requests.',
  '- Optimized slow analytical database queries and added B-Tree indexes, reducing p95 latency by 38%.',
  '- Collaborated with cross-functional teams in bi-weekly Agile sprints and CI/CD pipelines.',
  '',
  'PROJECTS',
  'AI-Driven Smart Campus Recruitment Portal (Next.js, Python, PostgreSQL, ChromaDB)',
  '- Built end-to-end recruitment management portal with vector semantic search and adaptive testing.',
  'Distributed Key-Value Store (Go, Distributed Systems)',
  '- Implemented Raft consensus protocol for state machine replication across a 5-node cluster.',
  '',
  'CERTIFICATIONS & ACHIEVEMENTS',
  '- AWS Certified Cloud Practitioner',
  '- HackerRank Problem Solving (Gold Badge, 5-Star)'
];

const pdfData = createSimplePdf(resumeLines);
const outPath = path.join(dir, 'Sample_Software_Engineer_Resume.pdf');
fs.writeFileSync(outPath, pdfData, 'binary');
console.log('Sample PDF created successfully at:', outPath);
