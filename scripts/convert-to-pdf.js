const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  let html = '';
  let inCode = false;
  let codeLang = '';
  let codeContent = [];
  let inTable = false;
  let tableHeaderParsed = false;
  let inList = false;
  let listType = ''; // 'ul' or 'ol'

  function closeList() {
    if (inList) {
      html += `</${listType}>\n`;
      inList = false;
      listType = '';
    }
  }

  function closeTable() {
    if (inTable) {
      html += '</tbody></table></div>\n';
      inTable = false;
      tableHeaderParsed = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      closeList();
      closeTable();
      if (!inCode) {
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeContent = [];
      } else {
        inCode = false;
        const escaped = codeContent
          .join('\n')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        html += `<div class="code-block"><div class="code-lang">${codeLang || 'text'}</div><pre><code>${escaped}</code></pre></div>\n`;
      }
      continue;
    }

    if (inCode) {
      codeContent.push(line);
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
      closeList();
      closeTable();
      html += '<hr />\n';
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      closeList();
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Check if it's separator row
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        tableHeaderParsed = true;
        continue;
      }

      if (!inTable) {
        inTable = true;
        html += '<div class="table-container"><table>\n<thead><tr>';
        cells.forEach((c) => {
          html += `<th>${inlineFormat(c)}</th>`;
        });
        html += '</tr></thead>\n<tbody>\n';
      } else {
        html += '<tr>';
        cells.forEach((c) => {
          html += `<td>${inlineFormat(c)}</td>`;
        });
        html += '</tr>\n';
      }
      continue;
    } else {
      closeTable();
    }

    // Headings
    const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      closeList();
      const level = hMatch[1].length;
      const text = inlineFormat(hMatch[2]);
      const id = hMatch[2].toLowerCase().replace(/[^a-z0-9]+/g, '-');
      html += `<h${level} id="${id}">${text}</h${level}>\n`;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      closeList();
      const text = inlineFormat(line.trim().slice(1).trim());
      html += `<blockquote>${text}</blockquote>\n`;
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
        html += '<ul>\n';
      }
      html += `<li>${inlineFormat(ulMatch[2])}</li>\n`;
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        inList = true;
        listType = 'ol';
        html += '<ol>\n';
      }
      html += `<li>${inlineFormat(olMatch[2])}</li>\n`;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      closeList();
      continue;
    }

    // Math block (e.g. $$\text{...}$$)
    if (line.trim().startsWith('$$') && line.trim().endsWith('$$')) {
      closeList();
      const formula = line.trim().slice(2, -2).trim();
      html += `<div class="math-block">${escapeHtml(formula)}</div>\n`;
      continue;
    }

    // Regular paragraph
    closeList();
    html += `<p>${inlineFormat(line)}</p>\n`;
  }

  closeList();
  closeTable();

  return html;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineFormat(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function buildHtmlDocument(title, contentHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: counter(page);
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 13.5px;
    }
    .header-banner {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 8px;
      margin-bottom: 28px;
      page-break-after: avoid;
    }
    .header-banner h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      border: none;
      padding: 0;
    }
    .header-banner p {
      margin: 0;
      font-size: 14px;
      color: #e0e7ff;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 6px;
      margin-top: 28px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    h2 {
      font-size: 17px;
      font-weight: 600;
      color: #1f2937;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 5px;
      margin-top: 24px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 14.5px;
      font-weight: 600;
      color: #374151;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 10px 0;
    }
    ul, ol {
      margin: 0 0 12px 0;
      padding-left: 24px;
    }
    li {
      margin-bottom: 4px;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 22px 0;
    }
    blockquote {
      margin: 12px 0;
      padding: 10px 16px;
      background-color: #f8fafc;
      border-left: 4px solid #3b82f6;
      color: #334155;
      font-style: normal;
      border-radius: 0 6px 6px 0;
      page-break-inside: avoid;
    }
    .table-container {
      margin: 14px 0;
      page-break-inside: avoid;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 7px 10px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 600;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .code-block {
      background-color: #0f172a;
      color: #f8fafc;
      border-radius: 6px;
      margin: 12px 0;
      overflow: hidden;
      page-break-inside: avoid;
      border: 1px solid #334155;
    }
    .code-lang {
      background-color: #1e293b;
      color: #94a3b8;
      font-size: 10.5px;
      padding: 3px 12px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    pre {
      margin: 0;
      padding: 10px 14px;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11.5px;
      line-height: 1.5;
    }
    code.inline-code {
      background-color: #f1f5f9;
      color: #dc2626;
      padding: 1.5px 5px;
      border-radius: 4px;
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .math-block {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      padding: 10px 14px;
      border-radius: 6px;
      margin: 12px 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      page-break-inside: avoid;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    @media print {
      body {
        font-size: 12px;
      }
      .code-block {
        background-color: #0f172a !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      th {
        background-color: #f1f5f9 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .header-banner {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%) !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .math-block {
        background-color: #f0fdf4 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <h1>${title}</h1>
    <p>Agentic AI-Based Intelligent Recruitment & Placement System</p>
  </div>
  ${contentHtml}
</body>
</html>`;
}

async function run() {
  const rootDir = path.resolve(__dirname, '..');
  const chromePath = 'C:\\Program Files\\Google\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

  console.log(`Using browser binary: ${browserBin}`);

  const targets = [
    {
      inputMd: path.join(rootDir, 'USER_MANUAL.md'),
      outputHtml: path.join(rootDir, 'USER_MANUAL.html'),
      outputPdf: path.join(rootDir, 'USER_MANUAL.pdf'),
      title: 'Platform User Manual',
    },
    {
      inputMd: path.join(rootDir, 'HOW_TO_RUN.md'),
      outputHtml: path.join(rootDir, 'HOW_TO_RUN.html'),
      outputPdf: path.join(rootDir, 'HOW_TO_RUN.pdf'),
      title: 'System Startup & Execution Guide',
    },
  ];

  for (const t of targets) {
    console.log(`\nProcessing ${t.inputMd} ...`);
    if (!fs.existsSync(t.inputMd)) {
      console.warn(`File not found: ${t.inputMd}`);
      continue;
    }

    const mdContent = fs.readFileSync(t.inputMd, 'utf-8');
    const parsedHtml = markdownToHtml(mdContent);
    const fullHtml = buildHtmlDocument(t.title, parsedHtml);

    fs.writeFileSync(t.outputHtml, fullHtml, 'utf-8');
    console.log(`Created HTML: ${t.outputHtml}`);

    const cmd = `"${browserBin}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${t.outputPdf}" "${t.outputHtml}"`;
    console.log(`Running Chrome Print-to-PDF...`);
    execSync(cmd, { stdio: 'inherit' });

    if (fs.existsSync(t.outputPdf)) {
      const stats = fs.statSync(t.outputPdf);
      console.log(`✅ Success! Generated PDF: ${t.outputPdf} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`❌ Failed to create PDF for ${t.title}`);
    }
  }
}

run().catch((e) => {
  console.error('Error generating PDF:', e);
  process.exit(1);
});
