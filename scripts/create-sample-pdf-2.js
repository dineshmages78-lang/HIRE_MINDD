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
  'Priya Patel',
  'Email: priya.patel@example.edu | Phone: +91 91234 56789 | Location: Mumbai, India',
  '',
  'SUMMARY',
  'Systems software engineer passionate about high-performance computing, distributed consensus, and cloud native architectures.',
  '',
  'TECHNICAL COMPETENCIES',
  'Languages: Rust, C++, Go, Python',
  'Cloud & Systems: Docker, Kubernetes, AWS, Linux, CI/CD',
  'Databases: Redis, PostgreSQL, MySQL',
  '',
  'EDUCATION',
  'Bachelor of Technology in Information Technology',
  'National Institute of Technology | CGPA: 9.15',
  '',
  'EXPERIENCE',
  'Cloud Engineering Intern | CloudScale Systems (May 2024 - July 2024)',
  '- Designed Kubernetes operators and automated deployment pipelines with GitHub Actions.',
  '',
  'PROJECTS',
  'High-Performance Async Cache Engine (Rust, Tokio, Redis)',
  '- Implemented an in-memory asynchronous cache with lock-free data structures.',
  '',
  'SOFT SKILLS',
  'Problem Solving, Team Collaboration, Leadership, Critical Thinking'
];

const pdfData = createSimplePdf(resumeLines);
const outPath = path.join(dir, 'Priya_Patel_Systems_Resume.pdf');
fs.writeFileSync(outPath, pdfData, 'binary');
console.log('Created 2nd sample PDF at:', outPath);
