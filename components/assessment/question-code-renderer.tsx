"use client";

import { useState } from "react";
import { Check, Copy, Code2, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuestionCodeRendererProps {
  text: string;
}

export function QuestionCodeRenderer({ text }: QuestionCodeRendererProps) {
  const [copied, setCopied] = useState(false);

  // Check if text contains a markdown code block ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_\-\+#]*)\s*\n([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);

  if (!match) {
    // Normal text without code block
    return (
      <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
        {text}
      </div>
    );
  }

  const beforeCode = text.substring(0, match.index).trim();
  const rawLang = match[1]?.trim() || "code";
  const codeContent = match[2]?.trimEnd();
  const afterCode = text.substring((match.index || 0) + match[0].length).trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = codeContent.split("\n");

  const getLanguageLabel = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === "ts" || l === "typescript") return "TypeScript";
    if (l === "js" || l === "javascript") return "JavaScript";
    if (l === "py" || l === "python") return "Python";
    if (l === "sql") return "SQL";
    if (l === "cpp" || l === "c++") return "C++";
    if (l === "java") return "Java";
    if (l === "docker" || l === "dockerfile") return "Dockerfile";
    if (l === "html") return "HTML";
    if (l === "css") return "CSS";
    return lang.toUpperCase() || "CODE";
  };

  return (
    <div className="space-y-4">
      {beforeCode && (
        <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
          {beforeCode}
        </div>
      )}

      {/* Styled Code Box */}
      <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-[#0f172a] shadow-lg">
        {/* Code Box Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <span className="font-mono font-medium ml-2 text-slate-400 flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-blue-400" />
              {getLanguageLabel(rawLang)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="p-3 sm:p-4 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed text-slate-200">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="pr-4 select-none text-slate-500 text-right w-8 text-[11px] align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre font-mono text-slate-100">
                    {line || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {afterCode && (
        <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 pt-1">
          {afterCode}
        </div>
      )}
    </div>
  );
}
